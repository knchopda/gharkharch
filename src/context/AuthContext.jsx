import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SAMPLE_USER, SAMPLE_HOUSEHOLD, SAMPLE_MEMBERS, DEFAULT_CATEGORIES, DEFAULT_PAYMENT_MODES } from '../lib/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [userRole, setUserRole] = useState(null); // 'owner' | 'member'
  const [pendingInviteCode, setPendingInviteCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Auto-detect ?invite=CODE from URL query parameters (e.g. from WhatsApp link)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlInvite = params.get('invite');
      if (urlInvite) {
        const cleanCode = urlInvite.trim().toUpperCase();
        sessionStorage.setItem('gharkharch_pending_invite', cleanCode);
        setPendingInviteCode(cleanCode);
      } else {
        const savedCode = sessionStorage.getItem('gharkharch_pending_invite');
        if (savedCode) setPendingInviteCode(savedCode);
      }
    } catch (e) {
      console.warn('URL search parameter check:', e);
    }
  }, []);

  // Initialize session & user household context
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        // Zero-config fallback mode for instant demonstration
        if (mounted) {
          setUser(SAMPLE_USER);
          setProfile(SAMPLE_USER);
          setHousehold(SAMPLE_HOUSEHOLD);
          setMembers(SAMPLE_MEMBERS);
          setUserRole('owner');
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          await loadUserData(session.user);
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setHousehold(null);
            setUserRole(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setAuthError(err.message);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes if Supabase is active
    let authListener = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setHousehold(null);
          setUserRole(null);
          setLoading(false);
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Fetch profile, user's household, and member role
  const loadUserData = async (authUser) => {
    try {
      setLoading(true);
      setUser(authUser);

      // 1. Fetch or create profile
      let { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profErr || !profData) {
        const newProf = {
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url || null,
        };
        const { data: insertedProf } = await supabase
          .from('profiles')
          .upsert(newProf)
          .select()
          .single();
        profData = insertedProf || newProf;
      }
      setProfile(profData);

      // 2. Fetch household membership
      const { data: memberData, error: memErr } = await supabase
        .from('household_members')
        .select('*, household:households(*)')
        .eq('user_id', authUser.id)
        .order('joined_at', { ascending: false });

      if (memErr) throw memErr;

      if (memberData && memberData.length > 0) {
        const activeMembership = memberData[0];
        setHousehold(activeMembership.household);
        setUserRole(activeMembership.role);

        // Load all co-members of this household
        const { data: coMembers } = await supabase
          .from('household_members')
          .select('*, profile:profiles(*)')
          .eq('household_id', activeMembership.household_id);

        setMembers(coMembers || []);
      } else {
        // User has no household yet — Check for pending WhatsApp invitation link!
        const storedInvite = sessionStorage.getItem('gharkharch_pending_invite');
        if (storedInvite) {
          console.log('Auto-redeeming pending WhatsApp invitation:', storedInvite);
          const redeemRes = await autoRedeemInvite(authUser, storedInvite);
          if (redeemRes.success) {
            sessionStorage.removeItem('gharkharch_pending_invite');
            setPendingInviteCode(null);
            return;
          }
        }

        setHousehold(null);
        setUserRole(null);
        setMembers([]);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Auto-redeem invitation code for new signup arriving via WhatsApp link
  const autoRedeemInvite = async (authUser, inviteCode) => {
    try {
      const { data: invite, error: inviteErr } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (inviteErr || !invite) return { success: false };

      const { error: joinErr } = await supabase
        .from('household_members')
        .insert({
          household_id: invite.household_id,
          user_id: authUser.id,
          role: 'member',
        });

      if (joinErr && !joinErr.message.includes('duplicate')) return { success: false };

      // Load household data directly
      const { data: hhData } = await supabase
        .from('households')
        .select('*')
        .eq('id', invite.household_id)
        .single();

      if (hhData) {
        setHousehold(hhData);
        setUserRole('member');
        return { success: true };
      }
      return { success: false };
    } catch (e) {
      console.error('Auto redeem invite failed:', e);
      return { success: false };
    }
  };

  // Onboarding Action 1: Create new Household
  const createHousehold = async (householdName) => {
    if (!isSupabaseConfigured) {
      const newHH = {
        id: `hh_${Date.now()}`,
        name: householdName,
        owner_id: user.id,
        created_at: new Date().toISOString(),
      };
      setHousehold(newHH);
      setUserRole('owner');
      return { success: true, household: newHH };
    }

    try {
      setLoading(true);

      const { data: existingProf } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      if (!existingProf) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
        });
      }

      const householdId = crypto.randomUUID();

      const { error: hhErr } = await supabase
        .from('households')
        .insert({
          id: householdId,
          name: householdName,
          owner_id: user.id,
        });

      if (hhErr) throw hhErr;

      const { error: memErr } = await supabase
        .from('household_members')
        .insert({
          household_id: householdId,
          user_id: user.id,
          role: 'owner',
        });

      if (memErr) throw memErr;

      const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
        household_id: householdId,
        name: cat.name,
        icon: cat.icon || 'Tag',
        sort_order: cat.sort_order || 1,
        is_active: true,
      }));
      await supabase.from('categories').insert(categoriesToInsert);

      const paymentModesToInsert = DEFAULT_PAYMENT_MODES.map(pm => ({
        household_id: householdId,
        name: pm.name,
        sort_order: pm.sort_order || 1,
        is_active: true,
      }));
      await supabase.from('payment_modes').insert(paymentModesToInsert);

      const createdHH = {
        id: householdId,
        name: householdName,
        owner_id: user.id,
        created_at: new Date().toISOString(),
      };

      setHousehold(createdHH);
      setUserRole('owner');
      sessionStorage.removeItem('gharkharch_pending_invite');

      await loadUserData(user);
      return { success: true, household: createdHH };
    } catch (err) {
      console.error('Failed to create household:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Action 2: Join existing Household by Invite Code
  const joinHouseholdByCode = async (inviteCode) => {
    const cleanCode = inviteCode.trim().toUpperCase();

    if (!isSupabaseConfigured) {
      setHousehold(SAMPLE_HOUSEHOLD);
      setUserRole('member');
      return { success: true };
    }

    try {
      setLoading(true);

      const { data: existingProf } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      if (!existingProf) {
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email,
        });
      }

      const { data: invite, error: inviteErr } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invite_code', cleanCode)
        .eq('status', 'pending')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (inviteErr || !invite) {
        return { success: false, error: 'Invalid or expired invitation code. Ask your household Owner for a new code.' };
      }

      const { error: joinErr } = await supabase
        .from('household_members')
        .insert({
          household_id: invite.household_id,
          user_id: user.id,
          role: 'member',
        });

      if (joinErr && !joinErr.message.includes('duplicate')) {
        throw joinErr;
      }

      sessionStorage.removeItem('gharkharch_pending_invite');

      await loadUserData(user);
      return { success: true };
    } catch (err) {
      console.error('Failed to join household:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supabase Auth Email Login
  const loginWithEmail = async (email, password) => {
    if (!isSupabaseConfigured) {
      setUser(SAMPLE_USER);
      setProfile(SAMPLE_USER);
      setHousehold(SAMPLE_HOUSEHOLD);
      setUserRole('owner');
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  };

  // Supabase Auth Email Signup
  const signupWithEmail = async (email, password, fullName) => {
    if (!isSupabaseConfigured) {
      const newUser = { id: `usr_${Date.now()}`, email, full_name: fullName };
      setUser(newUser);
      setProfile(newUser);
      return { success: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setHousehold(null);
    setMembers([]);
    setUserRole(null);
    sessionStorage.removeItem('gharkharch_pending_invite');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        household,
        members,
        userRole,
        pendingInviteCode,
        isOwner: userRole === 'owner',
        isMember: Boolean(userRole),
        loading,
        authError,
        createHousehold,
        joinHouseholdByCode,
        loginWithEmail,
        signupWithEmail,
        logout,
        loadUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
