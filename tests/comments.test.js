const request = require("supertest");
const app = require("../src/app");
const commentsService = require("../src/services/comments.service");
const postsService = require("../src/services/posts.service");

jest.mock("../src/services/comments.service");
jest.mock("../src/services/posts.service");

const comment = { id: 1, post_id: 1, author_id: 2, content: "¡Muy claro!" };

afterEach(() => jest.resetAllMocks());

describe("Comments", () => {
  it("GET /comments responde 200 con la lista", async () => {
    commentsService.findAll.mockResolvedValue([comment]);

    const res = await request(app).get("/comments");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([comment]);
  });

  it("GET /comments/:id responde 200 con el comment", async () => {
    commentsService.findById.mockResolvedValue(comment);

    const res = await request(app).get("/comments/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(comment);
    expect(commentsService.findById).toHaveBeenCalledWith(1);
  });

  it("GET /comments/:id responde 404 si no existe", async () => {
    commentsService.findById.mockResolvedValue(null);

    const res = await request(app).get("/comments/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "comment not found" });
  });

  it("GET /comments/:id responde 400 si el id no es un número", async () => {
    const res = await request(app).get("/comments/abc");

    expect(res.status).toBe(400);
    expect(commentsService.findById).not.toHaveBeenCalled();
  });

  it("POST /comments responde 201 con el comment creado", async () => {
    commentsService.create.mockResolvedValue(comment);

    const res = await request(app)
      .post("/comments")
      .send({ post_id: 1, author_id: 2, content: "¡Muy claro!" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(comment);
  });

  it("POST /comments responde 400 si falta el content", async () => {
    const res = await request(app).post("/comments").send({ post_id: 1, author_id: 2 });

    expect(res.status).toBe(400);
    expect(commentsService.create).not.toHaveBeenCalled();
  });

  it("GET /posts/:id/comments responde 200 con los comments del post", async () => {
    postsService.findById.mockResolvedValue({ id: 1 });
    commentsService.findByPost.mockResolvedValue([comment]);

    const res = await request(app).get("/posts/1/comments");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([comment]);
  });

  it("GET /posts/:id/comments responde 404 si el post no existe", async () => {
    postsService.findById.mockResolvedValue(null);

    const res = await request(app).get("/posts/999/comments");

    expect(res.status).toBe(404);
  });

  it("DELETE /comments/:id responde 204 al eliminar", async () => {
    commentsService.remove.mockResolvedValue(true);

    const res = await request(app).delete("/comments/1");

    expect(res.status).toBe(204);
  });

  it("DELETE /comments/:id responde 404 si no existe", async () => {
    commentsService.remove.mockResolvedValue(false);

    const res = await request(app).delete("/comments/999");

    expect(res.status).toBe(404);
  });
});

describe("Rutas generales", () => {
  it("GET /health responde 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("una ruta inexistente responde 404", async () => {
    const res = await request(app).get("/no-existe");

    expect(res.status).toBe(404);
  });
});
