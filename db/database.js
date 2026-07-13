const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = {
  users: {
    async findByEmail(email) {
      const { data } = await supabase
        .from('users').select('*').eq('email', email).single();
      return data || null;
    },
    async findById(id) {
      const { data } = await supabase
        .from('users').select('*').eq('id', id).single();
      return data || null;
    },
    async findByPhone(phone) {
      const { data } = await supabase
        .from('users').select('id').eq('phone', phone).single();
      return data || null;
    },
    async findByReferralCode(code) {
      const { data } = await supabase
        .from('users').select('*').eq('referral_code', code).single();
      return data || null;
    },
    async create({ email, password, name, phone }) {
      const { data, error } = await supabase
        .from('users')
        .insert({ email, password, name, phone: phone || '' })
        .select().single();
      if (error) throw error;
      return data;
    },
    async updatePlan(id, plan, plan_expires_at) {
      const { error } = await supabase
        .from('users').update({ plan, plan_expires_at }).eq('id', id);
      if (error) throw error;
    },
    async updatePassword(id, password) {
      const { error } = await supabase
        .from('users').update({ password }).eq('id', id);
      if (error) throw error;
    },
    async setTrialUsed(id) {
      const { error } = await supabase
        .from('users').update({ trial_used: true }).eq('id', id);
      if (error) throw error;
    },
    async setAffiliate(id, referralCode, expiresAt) {
      const { error } = await supabase
        .from('users').update({ user_type: 'affiliate', referral_code: referralCode, affiliate_expires_at: expiresAt || null }).eq('id', id);
      if (error) throw error;
    },
    async setAffiliateExpiry(id, expiresAt) {
      const { error } = await supabase
        .from('users').update({ affiliate_expires_at: expiresAt }).eq('id', id);
      if (error) throw error;
    },
    async setReferred(id, referredBy) {
      const { error } = await supabase
        .from('users').update({ user_type: 'referred', referred_by: referredBy }).eq('id', id);
      if (error) throw error;
    },
    async addPoints(id, amount) {
      const { data: user } = await supabase.from('users').select('points').eq('id', id).single();
      const current = user?.points || 0;
      const { error } = await supabase
        .from('users').update({ points: current + amount }).eq('id', id);
      if (error) throw error;
    },
    async deductPoints(id, amount) {
      const { data: user } = await supabase.from('users').select('points').eq('id', id).single();
      const current = user?.points || 0;
      if (current < amount) throw new Error('포인트가 부족합니다.');
      const { error } = await supabase
        .from('users').update({ points: current - amount }).eq('id', id);
      if (error) throw error;
    },
    async findAll() {
      const { data } = await supabase
        .from('users').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async findReferredBy(referralCode) {
      const { data } = await supabase
        .from('users').select('*').eq('referred_by', referralCode).order('created_at', { ascending: false });
      return data || [];
    },
    async setPoints(id, points) {
      const { error } = await supabase
        .from('users').update({ points }).eq('id', id);
      if (error) throw error;
    },
    async downgradeAffiliate(id) {
      const { error } = await supabase
        .from('users').update({ user_type: 'normal', referral_code: null }).eq('id', id);
      if (error) throw error;
    },
    async delete(id) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  },

  orders: {
    async create({ user_id, order_id, plan, amount, depositor }) {
      const { data, error } = await supabase
        .from('orders')
        .insert({ user_id, order_id, plan, amount, depositor: depositor || '', status: 'pending' })
        .select().single();
      if (error) throw error;
      return data;
    },
    async findByOrderId(order_id, user_id) {
      const { data } = await supabase
        .from('orders').select('*').eq('order_id', order_id).eq('user_id', user_id).single();
      return data || null;
    },
    async findAnyByOrderId(order_id) {
      const { data } = await supabase
        .from('orders').select('*').eq('order_id', order_id).single();
      return data || null;
    },
    async findByUserId(user_id) {
      const { data } = await supabase
        .from('orders').select('*').eq('user_id', user_id).order('created_at', { ascending: false });
      return data || [];
    },
    async findAll() {
      const { data } = await supabase
        .from('orders').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async updateStatus(order_id, status, payment_key) {
      const { error } = await supabase
        .from('orders').update({ status, payment_key }).eq('order_id', order_id);
      if (error) throw error;
    },
  },

  affiliateInvites: {
    async create(token) {
      const { data, error } = await supabase
        .from('affiliate_invites')
        .insert({ token })
        .select().single();
      if (error) throw error;
      return data;
    },
    async findByToken(token) {
      const { data } = await supabase
        .from('affiliate_invites').select('*').eq('token', token).single();
      return data || null;
    },
    async markUsed(token, userId) {
      const { error } = await supabase
        .from('affiliate_invites')
        .update({ used_by_user_id: userId, used_at: new Date().toISOString() })
        .eq('token', token);
      if (error) throw error;
    },
    async findAll() {
      const { data } = await supabase
        .from('affiliate_invites').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  },

  pointsTransactions: {
    async create({ user_id, type, amount, description, order_id }) {
      const { error } = await supabase
        .from('points_transactions')
        .insert({ user_id, type, amount, description, order_id: order_id || null });
      if (error) throw error;
    },
    async findByUserId(user_id) {
      const { data } = await supabase
        .from('points_transactions').select('*').eq('user_id', user_id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  },

  withdrawalRequests: {
    async create({ user_id, points_amount, cash_amount, bank_name, bank_account, bank_holder }) {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({ user_id, points_amount, cash_amount, bank_name, bank_account, bank_holder, status: 'pending' })
        .select().single();
      if (error) throw error;
      return data;
    },
    async findByUserId(user_id) {
      const { data } = await supabase
        .from('withdrawal_requests').select('*').eq('user_id', user_id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    async findAll() {
      const { data } = await supabase
        .from('withdrawal_requests').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    async updateStatus(id, status, admin_note) {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status, admin_note, processed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
  },
};
