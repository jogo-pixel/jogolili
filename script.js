const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const background = new Image();
background.src = "belem.jpeg"; 

const background2 = new Image();
background2.src = "belem2.png"; // segunda imagem de fundo

const player = new Image();
player.src = "lili.png";

const ouroBranco = new Image();
ouroBranco.src = "cocazero.png";

const barraOuro = new Image();
barraOuro.src = "barraourosf.png"; 

const bomba = new Image();
bomba.src = "bomba.png"; 

const playerParado = new Image();
playerParado.src = "lili.png";

const playerPasso1 = new Image();
playerPasso1.src = "lili2sf.png";

const playerPasso2 = new Image();
playerPasso2.src = "lili3sf.png";

const gatoPasso0 = new Image();
gatoPasso0.src = "cat1.png";

const gatoPasso1 = new Image();
gatoPasso1.src = "cat2.png";

const gatoPasso2 = new Image();
gatoPasso2.src = "cat3.png";

const bgWidth = canvas.width;
const bgHeight = canvas.height;

let bgX = 0;
const bgSpeed = 4;

let mapX = 0;
// Variáveis do personagem
const playerX = canvas.width / 2 - 40;
let playerY = 235;
const playerWidth = 70;
const playerHeight = 90;
let frameAtual = 0;
let contadorFrames = 0;
const velocidadeAnimacao = 10; // quanto menor, mais rápido troca os passos

// Pulo
let velocityY = 0;
const gravity = 0.5;
const jumpStrength = 12;
const groundY = 235;
let canJump = true;

// Controle
let keys = {};

// Pontuação e nível
let score = 0;
let nivel = 1;
let ourosParaProximoNivel = 10;

// Tamanhos dos itens
const ouroBrancoSize = 60;
const barraOuroSize = 100;

// Listas de itens
let ourosBrancos = [gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco()];
let barrasOuro = [];

// Obstáculos 
let obstaculos = [];
let velocidadeObstaculo = 4; // começa igual à velocidade do fundo

// Variáveis para animação do gato
let frameGatoAtual = 0;
let contadorFramesGato = 0;
const velocidadeAnimacaoGato = 10; // mesma ideia do player
const gatoX = 300; // posição fixa do gato no eixo X (ajuste se quiser)
const gatoY = 270; // posição fixa do gato no eixo Y (aproximada para seu cenário)
const gatoWidth = 50; // tamanho do gato
const gatoHeight = 50;

// Funções para gerar posições dos itens
function gerarOuroBranco() {
    return {
        x: mapX + canvas.width + Math.random() * 1000,
        y: Math.random() > 0.5 ? 235 : 150,
        collected: false,
    };
}

function gerarBarraOuro() {
    return {
        x: mapX + canvas.width + Math.random() * 1000,
        y: Math.random() > 0.5 ? 235 : 150,
        collected: false,
    };
}

function gerarObstaculo() {
    return {
        x: mapX + canvas.width + Math.random() * 800,
        y: Math.random() > 0.5 ? 235 : 150,
        size: 40, // tamanho da bolinha
    };
}

// Função para colisão circular (caixa do player x círculo da bomba)
function checarColisaoCircular(px, py, pw, ph, cx, cy, cr) {
    const closestX = Math.max(px, Math.min(cx, px + pw));
    const closestY = Math.max(py, Math.min(cy, py + ph));
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (cr * cr);
}

// Resetar o jogo quando colidir com obstáculo
function resetGame() {
    score = 0;
    nivel = 1;
    ourosParaProximoNivel = 10;
    mapX = 0;
    velocidadeObstaculo = 4;
    ourosBrancos = [gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco()];
    barrasOuro = [];
    obstaculos = [gerarObstaculo()];
    playerY = groundY;
    velocityY = 0;
    canJump = true;
}

// Controle de teclas
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if ((e.key === "ArrowUp" || e.key === " ") && canJump) {
        velocityY = -jumpStrength;
        canJump = false;
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Função para desenhar o gato animado (SEM texto e SEM requestAnimationFrame)
function desenharGato() {
    contadorFramesGato++;
    if (contadorFramesGato >= velocidadeAnimacaoGato) {
        contadorFramesGato = 0;
        frameGatoAtual = (frameGatoAtual + 1) % 3;
    }

    let imagemGato;
    if (frameGatoAtual === 0) imagemGato = gatoPasso0;
    else if (frameGatoAtual === 1) imagemGato = gatoPasso1;
    else imagemGato = gatoPasso2;

    ctx.drawImage(imagemGato, gatoX, gatoY, gatoWidth, gatoHeight);
}

// Loop do jogo
function gameLoop() {
    // Movimento do mapa
    if (keys["ArrowRight"] || keys["d"]) {
        mapX += bgSpeed;
    }
    if (keys["ArrowLeft"] || keys["a"]) {
        mapX -= bgSpeed;
        if (mapX < 0) mapX = 0; // não deixar voltar além do início
    }

    // Gravidade
    velocityY += gravity;
    playerY += velocityY;

    if (playerY > groundY) {
        playerY = groundY;
        velocityY = 0;
        canJump = true;
    }

    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Escolher background de acordo com o nível
    const currentBackground = nivel === 1 ? background : background2;

    // Movimento do fundo
    bgX = -mapX % bgWidth;

    // Desenhar fundo em looping
    ctx.drawImage(currentBackground, bgX, 0, bgWidth, bgHeight);
    ctx.drawImage(currentBackground, bgX + bgWidth, 0, bgWidth, bgHeight);
    ctx.drawImage(currentBackground, bgX - bgWidth, 0, bgWidth, bgHeight);

    // Desenhar ouros brancos
    ourosBrancos.forEach(o => {
        if (!o.collected) {
            const screenX = o.x - mapX;
            ctx.drawImage(ouroBranco, screenX, o.y, ouroBrancoSize, ouroBrancoSize);
        }
    });

    // Desenhar barras de ouro
    barrasOuro.forEach(b => {
        if (!b.collected) {
            const screenX = b.x - mapX;
            ctx.drawImage(barraOuro, screenX, b.y, barraOuroSize, barraOuroSize);
        }
    });

    // Atualizar e desenhar obstáculos
    obstaculos.forEach((obs, index) => {
        obs.x -= velocidadeObstaculo;
        const screenX = obs.x - mapX;

        // bomba
        ctx.drawImage(bomba, screenX, obs.y, obs.size, obs.size);

        // Colisão circular com o player
        const cx = screenX + obs.size / 2;
        const cy = obs.y + obs.size / 2;
        const cr = obs.size / 2;

        if (checarColisaoCircular(playerX, playerY, playerWidth, playerHeight, cx, cy, cr)) {
            resetGame();
        }

        // Remover obstáculo se sair da tela
        if (screenX + obs.size < 0) {
            obstaculos.splice(index, 1);
            obstaculos.push(gerarObstaculo());
        }
    });

    // Verificar coleta dos ouros brancos
    ourosBrancos.forEach(o => {
        if (!o.collected) {
            const screenX = o.x - mapX;
            if (
                playerX < screenX + ouroBrancoSize &&
                playerX + playerWidth > screenX &&
                playerY < o.y + ouroBrancoSize &&
                playerY + playerHeight > o.y
            ) {
                o.collected = true;
                score += 1;
                ourosBrancos.push(gerarOuroBranco());

                if (score >= ourosParaProximoNivel) {
                    nivel++;
                    ourosParaProximoNivel += 10;
                    velocidadeObstaculo += 1;
                }
            }
        }
    });

    // Verificar coleta das barras de ouro
    barrasOuro.forEach(b => {
        if (!b.collected) {
            const screenX = b.x - mapX;
            if (
                playerX < screenX + barraOuroSize &&
                playerX + playerWidth > screenX &&
                playerY < b.y + barraOuroSize &&
                playerY + playerHeight > b.y
            ) {
                b.collected = true;
                score += 5;
                barrasOuro.push(gerarBarraOuro());

                if (score >= ourosParaProximoNivel) {
                    nivel++;
                    ourosParaProximoNivel += 10;
                    velocidadeObstaculo += 1;
                }
            }
        }
    });

    // Desenhar o personagem animado
    let imagemPersonagem;

    if (keys["ArrowRight"] || keys["d"] || keys["ArrowLeft"] || keys["a"]) {
        contadorFrames++;
        if (contadorFrames >= velocidadeAnimacao) {
            contadorFrames = 0;
            frameAtual = (frameAtual + 1) % 3;
        }
        if (frameAtual === 0) imagemPersonagem = playerParado;
        else if (frameAtual === 1) imagemPersonagem = playerPasso1;
        else imagemPersonagem = playerPasso2;
    } else {
        imagemPersonagem = playerParado;
    }

    ctx.drawImage(imagemPersonagem, playerX, playerY, playerWidth, playerHeight);

    // Desenhar o gato animado
    desenharGato();

    // Pontuação e nível com fonte pixelada e contorno
    ctx.font = "20px 'Press Start 2P'";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "red";

    const texto1 = `Cocazero: ${score}/${ourosParaProximoNivel}`;
    const texto2 = `Nível ${nivel}`;

    ctx.strokeText(texto1, 10, 40);
    ctx.fillText(texto1, 10, 40);

    ctx.strokeText(texto2, 10, 70);
    ctx.fillText(texto2, 10, 70);

    requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
