-- Datos de ejemplo. Vacía las tablas y reinicia los ids antes de insertar.

TRUNCATE comments, posts, authors RESTART IDENTITY CASCADE;

INSERT INTO authors (name, email, bio) VALUES
  ('Ana García',   'ana@example.com',   'Desarrolladora backend y escritora técnica.'),
  ('Luis Pérez',   'luis@example.com',  'Apasionado por las bases de datos.'),
  ('María López',  'maria@example.com', NULL);

INSERT INTO posts (author_id, title, content, published) VALUES
  (1, 'Introducción a Express',        'Express es un framework minimalista para Node.js.', TRUE),
  (1, 'Middlewares explicados',        'Un middleware es una función que se ejecuta entre la request y la response.', TRUE),
  (2, 'PostgreSQL para principiantes', 'PostgreSQL es una base de datos relacional open source.', TRUE),
  (2, 'Claves foráneas',               'Una FK relaciona una tabla con otra y protege la integridad de los datos.', FALSE),
  (3, 'Mi primer post',                'Hola mundo desde mi blog.', FALSE);

INSERT INTO comments (post_id, author_id, content) VALUES
  (1, 2, '¡Muy claro, gracias!'),
  (1, 3, 'Me ayudó a entender las rutas.'),
  (3, 1, 'Excelente resumen.'),
  (5, 1, '¡Bienvenida al blog!');
