const request = require("supertest");
const app = require("../src/app");
const postsService = require("../src/services/posts.service");
const authorsService = require("../src/services/authors.service");

jest.mock("../src/services/posts.service");
jest.mock("../src/services/authors.service");

const author = { id: 1, name: "Ana García", email: "ana@example.com", bio: null };
const post = {
  id: 1,
  author_id: 1,
  title: "Introducción a Express",
  content: "Express es un framework minimalista.",
  published: true,
};

afterEach(() => jest.resetAllMocks());

describe("GET /posts", () => {
  it("responde 200 con la lista y el total en X-Total-Count", async () => {
    postsService.findAll.mockResolvedValue({ posts: [post], total: 1 });

    const res = await request(app).get("/posts");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([post]);
    expect(res.headers["x-total-count"]).toBe("1");
    expect(postsService.findAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      published: undefined,
    });
  });

  it("aplica paginación y filtro published", async () => {
    postsService.findAll.mockResolvedValue({ posts: [], total: 0 });

    const res = await request(app).get("/posts?limit=5&offset=10&published=true");

    expect(res.status).toBe(200);
    expect(postsService.findAll).toHaveBeenCalledWith({
      limit: 5,
      offset: 10,
      published: true,
    });
  });

  it("responde 400 si limit o published no son válidos", async () => {
    const res = await request(app).get("/posts?limit=0&published=quizas");

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(["limit", "published"]);
    expect(postsService.findAll).not.toHaveBeenCalled();
  });
});

describe("GET /posts/:id", () => {
  it("responde 200 con el post", async () => {
    postsService.findById.mockResolvedValue(post);

    const res = await request(app).get("/posts/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(post.title);
  });

  it("responde 404 si el post no existe", async () => {
    postsService.findById.mockResolvedValue(null);

    const res = await request(app).get("/posts/999");

    expect(res.status).toBe(404);
  });
});

describe("GET /posts/author/:authorId", () => {
  it("responde 200 con el author y sus posts", async () => {
    authorsService.findById.mockResolvedValue(author);
    postsService.findByAuthor.mockResolvedValue([post]);

    const res = await request(app).get("/posts/author/1");

    expect(res.status).toBe(200);
    expect(res.body.author).toEqual(author);
    expect(res.body.posts).toEqual([post]);
  });

  it("responde 404 si el author no existe", async () => {
    authorsService.findById.mockResolvedValue(null);

    const res = await request(app).get("/posts/author/999");

    expect(res.status).toBe(404);
    expect(postsService.findByAuthor).not.toHaveBeenCalled();
  });
});

describe("POST /posts", () => {
  it("responde 201 con el post creado", async () => {
    postsService.create.mockResolvedValue(post);

    const res = await request(app).post("/posts").send({
      author_id: 1,
      title: post.title,
      content: post.content,
      published: true,
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(post);
  });

  it("responde 400 si faltan title, content o author_id", async () => {
    const res = await request(app).post("/posts").send({ title: "" });

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["author_id", "title", "content"]));
    expect(postsService.create).not.toHaveBeenCalled();
  });

  it("responde 400 si el author_id no existe en la base", async () => {
    const fkError = Object.assign(new Error("fk violation"), { code: "23503" });
    postsService.create.mockRejectedValue(fkError);

    const res = await request(app)
      .post("/posts")
      .send({ author_id: 999, title: "T", content: "C" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REFERENCE");
  });
});

describe("PUT /posts/:id", () => {
  it("responde 200 con el post actualizado", async () => {
    postsService.update.mockResolvedValue({ ...post, title: "Nuevo título" });

    const res = await request(app)
      .put("/posts/1")
      .send({ author_id: 1, title: "Nuevo título", content: post.content });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Nuevo título");
  });

  it("responde 404 si el post no existe", async () => {
    postsService.update.mockResolvedValue(null);

    const res = await request(app)
      .put("/posts/999")
      .send({ author_id: 1, title: "T", content: "C" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /posts/:id", () => {
  it("responde 204 al eliminar", async () => {
    postsService.remove.mockResolvedValue(true);

    const res = await request(app).delete("/posts/1");

    expect(res.status).toBe(204);
  });

  it("responde 404 si el post no existe", async () => {
    postsService.remove.mockResolvedValue(false);

    const res = await request(app).delete("/posts/999");

    expect(res.status).toBe(404);
  });
});
