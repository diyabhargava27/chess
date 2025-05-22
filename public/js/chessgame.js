const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = "w"; // Default role set (change as needed)

// Function to get piece unicode symbols
const getPieceUnicode = (piece) => {
    const pieceSymbols = {
        p: "♙", r: "♖", n: "♘", b: "♗", q: "♕", k: "♔",
        P: "♟", R: "♜", N: "♞", B: "♝", Q: "♛", K: "♚"
    };
    return pieceSymbols[piece.type] || "";
};

// Function to render the chessboard
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";

    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");

            // ✅ Correct CSS classes for squares
            const isLightSquare = (rowindex + squareindex) % 2 === 0;
            squareElement.classList.add("square", isLightSquare ? "square-light" : "square-dark");

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");

                // ✅ Add actual chess pieces (Unicode symbols)
                pieceElement.innerText = getPieceUnicode(square); 

                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    console.log("Board Rendered Successfully ✅");

    if(playerRole == 'b'){
    boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

// Function to handle a move
const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q"
    };

    console.log("Attempting move:", move);

    // ✅ Validate move before emitting
    const moveResult = chess.move(move);
    if (moveResult) {
        console.log("Move successful:", moveResult);
        socket.emit("move", move);
        renderBoard(); // Update board after move
    } else {
        console.log("Invalid move ❌:", move);
    }
};

// Socket listeners
socket.on("playerRole", function(role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(role) {
    playerRole = null;
    renderBoard();
});

// ✅ Fix incorrect event listener
socket.on("boardState", function(fen) {
    console.log("Received updated board state:", fen);
    chess.load(fen);
    renderBoard();
});

// Initial render
renderBoard();