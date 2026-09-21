import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

const PORT = 3000;

app.get("/", (req,res) => {
    res.json({
        title: 'Plataforma de Leilões',
        message: 'Servidor funfannnnte!'
    }

    );
});

app.listen(PORT,() =>{
    console.log(`Servidor rodante em http://localhost:${PORT}`);
});

console.log(typeof app)