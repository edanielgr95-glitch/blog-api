// Tests de integración: prueban la API contra una base PostgreSQL REAL, sin mocks.
// Verifican lo que los tests con mocks no pueden: las constraints, las FK,
// el CASCADE / SET NULL y que los datos realmente se guarden.
//
// ⚠️ Necesitan una base de PRUEBAS separada, porque borran todos sus datos:
//    TEST_DATABASE_URL=postgresql://usuario@localhost:5432/blog_api_test npm run test:integration
const fs = require("fs");
const path = require("path");

const TEST_DB = process.env.TEST_DATABASE_URL;
if (TEST_DB) {
  process.env.DATABASE_URL = TEST_DB;
}

const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/db/pool");

// Sin TEST_DATABASE_URL los tests se saltan, para no tocar nunca otra base
const describeIfDb = TEST_DB ? describe : describe.skip;

describeIfDb("API con base de datos real", () => {
  beforeAll(async () => {
    const setupSql = fs.readFileSync(path.join(__dirname, "..", "..", "db", "setup.sql"), "utf8");
    await pool.query(setupSql);
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE comments, posts, authors RESTART IDENTITY CASCADE");
  });

  afterAll(async () => {
    await pool.end();
  });

  async function createAuthor(name, email) {
    const res = await request(app).post("/authors").send({ name, email });
    return res.body;
  }

  async function createPost(authorId, title) {
    const res = await request(app)
      .post("/posts")
      .send({ author_id: authorId, title, content: "Contenido", published: true });
    return res.body;
  }

  it("crea un author y queda guardado en la base", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ name: "Ana", email: "ANA@example.com" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("ana@example.com");

    const saved = await request(app).get(`/authors/${res.body.id}`);
    expect(saved.status).toBe(200);
    expect(saved.body.name).toBe("Ana");
  });

  it("rechaza un email repetido con 400 (constraint UNIQUE)", async () => {
    await createAuthor("Ana", "ana@example.com");

    const res = await request(app)
      .post("/authors")
      .send({ name: "Otra Ana", email: "ana@example.com" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "email already exists" });
  });

  it("devuelve el author con sus posts en /posts/author/:authorId", async () => {
    const author = await createAuthor("Luis", "luis@example.com");
    await createPost(author.id, "Primer post");
    await createPost(author.id, "Segundo post");

    const res = await request(app).get(`/posts/author/${author.id}`);

    expect(res.status).toBe(200);
    expect(res.body.author.id).toBe(author.id);
    expect(res.body.posts.map((p) => p.title)).toEqual(["Primer post", "Segundo post"]);
  });

  it("rechaza un post con author_id inexistente con 400 (FK)", async () => {
    const res = await request(app)
      .post("/posts")
      .send({ author_id: 999, title: "T", content: "C" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "referenced author or post does not exist" });
  });

  it("pagina los posts con page y limit", async () => {
    const author = await createAuthor("Ana", "ana@example.com");
    for (let i = 1; i <= 5; i++) {
      await createPost(author.id, `Post ${i}`);
    }

    const res = await request(app).get("/posts?page=2&limit=2");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.data.map((p) => p.title)).toEqual(["Post 3", "Post 4"]);
  });

  it("al borrar un post se borran sus comments (ON DELETE CASCADE)", async () => {
    const author = await createAuthor("Ana", "ana@example.com");
    const post = await createPost(author.id, "Post");
    const comment = await request(app)
      .post("/comments")
      .send({ post_id: post.id, author_id: author.id, content: "Hola" });

    await request(app).delete(`/posts/${post.id}`).expect(204);

    const res = await request(app).get(`/comments/${comment.body.id}`);
    expect(res.status).toBe(404);
  });

  it("al borrar un author, sus comments en posts de otros quedan con author_id null (SET NULL)", async () => {
    const ana = await createAuthor("Ana", "ana@example.com");
    const luis = await createAuthor("Luis", "luis@example.com");
    const postDeAna = await createPost(ana.id, "Post de Ana");
    const comment = await request(app)
      .post("/comments")
      .send({ post_id: postDeAna.id, author_id: luis.id, content: "Buen post" });

    await request(app).delete(`/authors/${luis.id}`).expect(204);

    const res = await request(app).get(`/comments/${comment.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.author_id).toBeNull();
  });
});
