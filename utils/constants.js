// Tables anyone can read through the public site.
const PublicTables = ["artista", "exposicao", "imagem", "novidade", "obra", "residencia", "research", "project"];

// Tables only an admin can read; "admin" (login/senha) is legacy, replaced by Supabase Auth.
const PrivateTables = ["newsletter", "usuario", "exposicao_imagens"];

// Tables an admin can write to.
const WritableTables = [...PublicTables, "newsletter", "exposicao_imagens"];

const Tables = [...PublicTables, ...PrivateTables];

const StorageBucket = "kika-app";

module.exports = {
  Tables,
  PublicTables,
  PrivateTables,
  WritableTables,
  StorageBucket,
};
