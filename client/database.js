const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://zakfzizunydhireohsxt.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAll(table) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    throw error;
  }
  return data;
}

async function findOne(table, id) {
  const tableWithImages = ['obra', 'exposicao', 'newsletter', 'novidade']
  if (tableWithImages.includes(table)) {
    const { data, error } = await supabase.from(table).select(`
    *,  
    imagem ( imageURL )
  `).eq("id", id);
    if (error) {
      throw error;
    }
    return data ? data[0] : null;
  }

  const { data, error } = await supabase.from(table).select().eq("id", id);
  if (error) {
    throw error;
  }
  return data ? data[0] : null;
}

async function create(table, body) {
  const { data, error } = await supabase
    .from(table)
    .insert(body)
    .select();
  if (error) {
    throw error;
  }
  return data;
}

async function update(table, id, body = {}) {
  const { data, error } = await supabase
    .from(table)
    .update(body)
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}

async function remove(table, id) {
  const { data, error } = await supabase.from(table).delete().eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}

module.exports = {
  findAll,
  findOne,
  create,
  update,
  remove,
};