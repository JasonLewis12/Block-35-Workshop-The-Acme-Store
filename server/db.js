const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const client = new Client({
  connectionString:
    process.env_DATABASE_URL || "postgres://localhost/the_acme_store",
});

async function createTables() {
  try {
    await client.query(`
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS product;
    
  
          
    CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(225));


    CREATE TABLE product (
    id UUID PRIMARY KEY,
    name VARCHAR(225));

 CREATE TABLE favorite (
    id UUID PRIMARY KEY,

    users_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    product_id UUID NOT NULL REFERENCES product(id) ON DELETE CASCADE,

    CONSTRAINT unique_favorite UNIQUE (users_id, product_id));`);
  } catch (error) {
    console.error("there was an error creating/dropping your tables", error);
  }
}

async function createProduct({ name }) {
  const id = uuidv4();
  try {
    const result = await client.query(
      `
        INSERT INTO product (id,name)
        VALUES ($1,$2) RETURNING *;
        `,
      [id, name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("there was an error inserting into the product table", error);
  }
}

async function createUser({ username, password }) {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await client.query(
      `  INSERT INTO users(id,username,password)
         VALUES ($1,$2,$3) RETURNING *;
            `,
      [id, username, hashedPassword]
    );
    return result.rows[0];
  } catch (error) {
    console.error("there was an error create a user", error);
  }
}

async function fetchUsers() {
  try {
    const result = await client.query(` SELECT * FROM users`);
    return result.rows;
  } catch (error) {
    console.error("there was an errro fetching users", error);
  }
}
async function fetchProducts() {
  try {
    const result = await client.query(`SELECT * FROM product `);
    return result.rows;
  } catch (error) {
    console.error("there was an error fetching product", error);
  }
}

async function fetchFavorites({ id }) {
  try {
    const users = await fetchUsers();
    const user = users.find((user) => user.username === id);
    const userId = user.id;

    const product = await client.query(
      `SELECT product_id FROM favorite WHERE users_id = $1 `,
      [userId]
    );
    const product_id = product.rows[0].product_id;
    const result = await client.query(
      `SELECT name FROM product WHERE id = $1`,
      [product_id]
    );
    return result.rows[0].name;
  } catch (error) {
    console.error("there was an error fetching favorites", error);
  }
}

async function destroyFavorite({ id }) {
  try {
    const users = await fetchUsers();
    const user = users.find((user) => user.username === id);
    const userId = user.id;

    await client.query(`DELETE FROM favorite WHERE id =$1;`, [userId]);
    console.log(`record ${id} has been removed`);
  } catch (error) {
    1;
    console.error("there was an error delete a record", error);
  }
}
async function createFavorite({ users_id, product_id }) {
  const id = uuidv4();

  try {
    const productResult = await client.query(
      `SELECT id FROM product WHERE name = $1`,
      [product_id]
    );
    const productId = productResult.rows[0].id;
    const users = await fetchUsers();
    const user = users.find((user) => user.username === users_id);
    const userId = user.id;

    const result = await client.query(
      `INSERT INTO favorite (id, users_id, product_id) VALUES ($1, $2, $3) RETURNING *`,
      [id, userId, productId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("There was an error creating a favorite:", error);
  }
}

module.exports = {
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  createFavorite,
  createTables,
  client,
};
