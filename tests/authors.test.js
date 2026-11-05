// Tests de la capa HTTP (rutas + validaciones + controllers + manejo de errores).
// El service se reemplaza por un mock, así los tests no necesitan una base de datos real.
const request = require("supertest");
const app = require("../src/app");
const authorsService = require("../src/services/authors.service");

jest.mock("../src/services/authors.service");

const author = {
  id: 1,
  name: "Ana García",
  email: "ana@example.com",
  bio: null,
  created_at: "2026-01-01T00:00:00.000Z",
};

afterEach(() => jest.resetAllMocks());

describe("GET /authors", () => {
  it("responde 200 con la lista de authors", async () => {
    authorsService.findAll.mockResolvedValue([author]);

    const res = await request(app).get("/authors");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([author]);
  });

  it("responde 500 si falla la base de datos", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    authorsService.findAll.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/authors");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});

describe("GET /authors/:id", () => {
  it("responde 200 con el author", async () => {
    authorsService.findById.mockResolvedValue(author);

    const res = await request(app).get("/authors/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(author);
    expect(authorsService.findById).toHaveBeenCalledWith(1);
  });

  it("responde 404 si el author no existe", async () => {
    authorsService.findById.mockResolvedValue(null);

    const res = await request(app).get("/authors/999");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("responde 400 si el id no es un número", async () => {
    const res = await request(app).get("/authors/abc");

    expect(res.status).toBe(400);
    expect(authorsService.findById).not.toHaveBeenCalled();
  });
});

describe("POST /authors", () => {
  it("responde 201 y normaliza el email", async () => {
    authorsService.create.mockResolvedValue(author);

    const res = await request(app)
      .post("/authors")
      .send({ name: "  Ana García ", email: "ANA@example.com" });

    expect(res.status).toBe(201);
    expect(authorsService.create).toHaveBeenCalledWith({
      name: "Ana García",
      email: "ana@example.com",
      bio: null,
    });
  });

  it("responde 400 si falta el name", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ email: "ana@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual({
      field: "name",
      issue: "is required",
    });
    expect(authorsService.create).not.toHaveBeenCalled();
  });

  it("responde 400 si el email no es válido", async () => {
    const res = await request(app)
      .post("/authors")
      .send({ name: "Ana", email: "no-es-un-email" });

    expect(res.status).toBe(400);
  });

  it("responde 400 si el body no es JSON válido", async () => {
    const res = await request(app)
      .post("/authors")
      .set("Content-Type", "application/json")
      .send("{malformado");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("responde 409 si el email ya existe", async () => {
    const duplicateError = Object.assign(new Error("duplicate key"), {
      code: "23505",
    });
    authorsService.create.mockRejectedValue(duplicateError);

    const res = await request(app)
      .post("/authors")
      .send({ name: "Ana", email: "ana@example.com" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("DUPLICATE");
  });
});

describe("PUT /authors/:id", () => {
  it("responde 200 con el author actualizado", async () => {
    authorsService.update.mockResolvedValue({ ...author, name: "Ana G." });

    const res = await request(app)
      .put("/authors/1")
      .send({ name: "Ana G.", email: "ana@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ana G.");
  });

  it("responde 404 si el author no existe", async () => {
    authorsService.update.mockResolvedValue(null);

    const res = await request(app)
      .put("/authors/999")
      .send({ name: "X", email: "x@example.com" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /authors/:id", () => {
  it("responde 204 sin body", async () => {
    authorsService.remove.mockResolvedValue(true);

    const res = await request(app).delete("/authors/1");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("responde 404 si el author no existe", async () => {
    authorsService.remove.mockResolvedValue(false);

    const res = await request(app).delete("/authors/999");

    expect(res.status).toBe(404);
  });
});
