// Tests unitarios de los services (la lógica de acceso a datos).
// Se reemplaza el Pool de PostgreSQL por un mock para verificar que cada
// función arma la consulta parametrizada correcta y devuelve lo esperado.
const pool = require("../src/db/pool");
const authorsService = require("../src/services/authors.service");
const postsService = require("../src/services/posts.service");
const commentsService = require("../src/services/comments.service");

jest.mock("../src/db/pool", () => ({ query: jest.fn() }));

afterEach(() => jest.resetAllMocks());

describe("authors.service", () => {
  it("findById usa una consulta parametrizada y devuelve el author", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, name: "Ana" }] });

    const author = await authorsService.findById(1);

    expect(author).toEqual({ id: 1, name: "Ana" });
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("WHERE id = $1");
    expect(params).toEqual([1]);
  });

  it("findById devuelve null si no hay filas", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    expect(await authorsService.findById(999)).toBeNull();
  });

  it("create inserta los valores como parámetros, nunca dentro del SQL", async () => {
    const input = { name: "Ana'; DROP TABLE authors; --", email: "a@x.com", bio: null };
    pool.query.mockResolvedValue({ rows: [{ id: 1, ...input }] });

    await authorsService.create(input);

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).not.toContain("DROP TABLE");
    expect(params).toEqual([input.name, input.email, input.bio]);
  });

  it("remove devuelve false si no se borró ninguna fila", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });

    expect(await authorsService.remove(999)).toBe(false);
  });
});

describe("posts.service", () => {
  it("findAll aplica filtro published, limit y offset como parámetros", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: 3 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const result = await postsService.findAll({ limit: 5, offset: 10, published: true });

    expect(result).toEqual({ posts: [{ id: 1 }], total: 3 });
    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).toContain("WHERE published = $1");
    expect(sql).toContain("LIMIT $2 OFFSET $3");
    expect(params).toEqual([true, 5, 10]);
  });

  it("findAll sin filtro no agrega WHERE", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [] });

    await postsService.findAll();

    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).not.toContain("WHERE");
    expect(params).toEqual([20, 0]);
  });

  it("update devuelve null si el post no existe", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const post = await postsService.update(999, {
      author_id: 1,
      title: "T",
      content: "C",
      published: false,
    });

    expect(post).toBeNull();
  });
});

describe("comments.service", () => {
  it("findByPost trae el nombre del autor con LEFT JOIN", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 1, author_name: "Luis" }] });

    const comments = await commentsService.findByPost(1);

    expect(comments[0].author_name).toBe("Luis");
    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toContain("LEFT JOIN authors");
    expect(params).toEqual([1]);
  });
});
