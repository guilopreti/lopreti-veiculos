const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const db = mysql.createPool({
  host: "server-bd-cn1.mysql.database.azure.com",
  user: "useradmin",
  password: "admin@123",
  database: "guilopretiVeiculos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Erro ao conectar ao banco:", err);
  } else {
    console.log("Conectado ao MySQL do Azure!");
    connection.release();
  }
});

// Listar todos os veículos
app.get("/api/veiculos", (req, res) => {
  db.query("SELECT * FROM veiculos ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Buscar veículos com filtros
app.get("/api/veiculos/buscar", (req, res) => {
  const { marca, modelo, disponivel } = req.query;

  let query = "SELECT * FROM veiculos WHERE 1=1";
  const params = [];

  if (marca) {
    query += " AND marca LIKE ?";
    params.push(`%${marca}%`);
  }
  if (modelo) {
    query += " AND modelo LIKE ?";
    params.push(`%${modelo}%`);
  }
  if (disponivel) {
    query += " AND disponivel = ?";
    params.push(disponivel === "sim" ? 1 : 0);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Criar veículo
app.post("/api/veiculos", (req, res) => {
  const { marca, modelo, ano, placa, preco, disponivel } = req.body;

  const query =
    "INSERT INTO veiculos (marca, modelo, ano, placa, preco_diaria, disponivel) VALUES (?, ?, ?, ?, ?, ?)";
  const disponivelValue = disponivel === "sim" ? 1 : 0;

  db.query(
    query,
    [marca, modelo, ano, placa, preco, disponivelValue],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, message: "Veículo criado com sucesso!" });
    }
  );
});

// Atualizar veículo
app.put("/api/veiculos/:id", (req, res) => {
  const { id } = req.params;
  const { marca, modelo, ano, placa, preco, disponivel } = req.body;

  const query =
    "UPDATE veiculos SET marca = ?, modelo = ?, ano = ?, placa = ?, preco_diaria = ?, disponivel = ? WHERE id = ?";
  const disponivelValue = disponivel === "sim" ? 1 : 0;

  db.query(
    query,
    [marca, modelo, ano, placa, preco, disponivelValue, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Veículo atualizado com sucesso!" });
    }
  );
});

// Excluir veículo
app.delete("/api/veiculos/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM veiculos WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Veículo excluído com sucesso!" });
  });
});

// Listar todos os clientes
app.get("/api/clientes", (req, res) => {
  db.query("SELECT * FROM clientes ORDER BY id DESC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Criar cliente
app.post("/api/clientes", (req, res) => {
  const { nome, cpf, email, telefone, endereco } = req.body;

  const query =
    "INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [nome, cpf, email, telefone, endereco], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, message: "Cliente criado com sucesso!" });
  });
});

// Atualizar cliente
app.put("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cpf, email, telefone, endereco } = req.body;

  const query =
    "UPDATE clientes SET nome = ?, cpf = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?";

  db.query(query, [nome, cpf, email, telefone, endereco, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Cliente atualizado com sucesso!" });
  });
});

// Excluir cliente
app.delete("/api/clientes/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM clientes WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Cliente excluído com sucesso!" });
  });
});

// Histórico de locações do cliente
app.get("/api/clientes/:id/historico", (req, res) => {
  const { id } = req.params;

  const query = `
        SELECT l.*, v.marca, v.modelo, c.nome as cliente_nome
        FROM locacoes l
        JOIN veiculos v ON l.veiculo_id = v.id
        JOIN clientes c ON l.cliente_id = c.id
        WHERE l.cliente_id = ?
        ORDER BY l.data_inicio DESC
    `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Listar todas as locações
app.get("/api/locacoes", (req, res) => {
  const query = `
        SELECT l.*, 
               c.nome as cliente_nome,
               v.marca, v.modelo
        FROM locacoes l
        JOIN clientes c ON l.cliente_id = c.id
        JOIN veiculos v ON l.veiculo_id = v.id
        ORDER BY l.id DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Criar locação
app.post("/api/locacoes", (req, res) => {
  const { veiculoId, clienteId, inicio, fim, valor } = req.body;

  const query =
    "INSERT INTO locacoes (veiculo_id, cliente_id, data_inicio, data_fim, valor_total, status) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [veiculoId, clienteId, inicio, fim, valor, "ativa"],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, message: "Locação criada com sucesso!" });
    }
  );
});

// Atualizar locação
app.put("/api/locacoes/:id", (req, res) => {
  const { id } = req.params;
  const { veiculoId, clienteId, inicio, fim, valor, status } = req.body;

  const query =
    "UPDATE locacoes SET veiculo_id = ?, cliente_id = ?, data_inicio = ?, data_fim = ?, valor_total = ?, status = ? WHERE id = ?";

  db.query(
    query,
    [veiculoId, clienteId, inicio, fim, valor, status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Locação atualizada com sucesso!" });
    }
  );
});

// Cancelar locação
app.patch("/api/locacoes/:id/cancelar", (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE locacoes SET status = ? WHERE id = ?",
    ["cancelada", id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Locação cancelada com sucesso!" });
    }
  );
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
