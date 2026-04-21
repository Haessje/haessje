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
    async findAll() {
      const { data } = await supabase
        .from('users').select('*').order('created_at', { ascending: false });
      return data || [];
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
};
