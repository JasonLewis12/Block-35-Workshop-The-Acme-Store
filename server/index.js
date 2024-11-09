//importing
const express = require("express");
const app = express();
const PORT = 8080;
const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
  createFavorite,
} = require("./db");
init();
async function init() {
  try {
    //connecting to database
    app.listen(PORT);
    await client.connect();
  } catch (error) {
    console.error("there was an error connecting to your database", error);
  }

  try {
    //inserting data
    await createTables();
    const [jason, max, kevim, RYOBI, MILWAUKEE, DEWALT] = await Promise.all([
      await createUser({ username: "jason", password: "123" }),
      await createUser({ username: "max", password: "123" }),
      await createUser({ username: "kevin", password: "123" }),
      await createUser({ username: "kay", password: "123" }),
      await createProduct({ name: "RYOBI" }),
      await createProduct({ name: "MILWAUKEE" }),
      await createProduct({ name: "DEWALT" }),
      await createFavorite({ users_id: "jason", product_id: "RYOBI" }),
      await createFavorite({ users_id: "max", product_id: "MILWAUKEE" }),
      await createFavorite({ users_id: "kevin", product_id: "DEWALT" }),
    ]);
  } catch (error) {
    console.error("there was an error create your data", error);
  }
}
//==========================routes======================================================//
app.use(express.json());
//get uses
app.get("/api/users", async (req, res) => {
  const users = await fetchUsers();
  res.status(200).json(users);
});
//get products
app.get("/api/products", async (req, res) => {
  const products = await fetchProducts();
  res.status(200).json(products);
});
//get favorites
app.get("/api/users/:id/favorites", async (req, res) => {
  const id = req.params.id;
  const favorite = await fetchFavorites({ id });
  res.status(200).json(favorite);
});
//create favorites
app.post("/api/users/:id/favorites", async (req, res) => {
  const users_id = req.params.id;
  const product_id = req.body.product_id;
  const makeFavorite = await createFavorite({ users_id, product_id });
  res.status(200).json(makeFavorite);
});
// delete favorites
app.delete("/api/users/:userId/favorites/:id", async (req, res) => {
  id = req.params.id;
  const deleteFavorite = await destroyFavorite({ id });
  res.status(200).json({ message: "record has been deleted" });
});
