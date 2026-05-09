const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = 'https://eyhkeplvlebxzwydslpe.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);
const tableWithImages = ['obra', 'exposicao', 'novidade']

function buildSelect(table) {
  if (tableWithImages.includes(table)) {
    return `
      *,
      imagem ( imageURL )
    `;
  }

  return "*";
}

async function findAll(table) {
  if (tableWithImages.includes(table)) {
    const { data, error } = await supabase.from(table).select(`
    *,  
    imagem ( imageURL )
    `);
    if (error) {
      throw error;
    }
    return data;
  };
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    throw error;
  }
  return data;
}

async function findOne(table, id) {
  const { data, error } = await supabase
    .from(table)
    .select(buildSelect(table))
    .eq("id", id);

  if (error) throw error;

  return data ? data[0] : null;
}

async function findBySlug(table, slug) {

  if (table === "exposicao") {

    const { data, error } = await supabase
      .from("exposicao")
      .select(`
        id,
        titulo,
        slug,
        texto,
        ano,
        local,
        exposicao_imagens (
          ordem,
          imagem (
            imageURL
          )
        )
      `)
      .eq("slug", slug)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
  
  const { data, error } = await supabase
    .from(table)
    .select(buildSelect(table))
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data
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
  findBySlug,
  create,
  update,
  remove,
};
