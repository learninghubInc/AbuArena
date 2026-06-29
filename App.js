import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashSub}>LAUNCHING ARCADE HUB...</Text>
        <Text style={styles.splashTitle}>Abu Arena</Text>
        <Text style={styles.splashTitleSub}>Stick Mayhem v2</Text>
        <View style={styles.divider} />
        <Text style={styles.developerText}>Developed by AbuLearn</Text>
      </View>
    );
  }

  // HTML5 Game Engine featuring Main Menu, Game Selection, and the Arena Floor
  const gameHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { margin: 0; background: #0F0F13; overflow: hidden; font-family: 'Arial Black', sans-serif; user-select: none; color: white; }
        canvas { display: block; margin: 0 auto; background: #16161E; }
        
        /* Menu System Overlay styles */
        .menu-layer { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 15, 19, 0.95); }
        .menu-title { font-size: 38px; color: #FFCC33; text-shadow: 3px 3px #FF3366; margin-bottom: 30px; letter-spacing: 2px; text-transform: uppercase; }
        .menu-btn { background: linear-gradient(135deg, #00E676, #00B0FF); border: none; padding: 15px 40px; color: white; font-size: 20px; font-weight: bold; border-radius: 50px; margin: 10px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,230,118,0.4); text-transform: uppercase; }
        .menu-btn:active { transform: scale(0.95); }
        
        /* Game Selection Cards */
        .grid { display: flex; gap: 20px; }
        .card { background: #22222E; border: 3px solid #33CCFF; padding: 20px; border-radius: 15px; text-align: center; width: 140px; }
        
        /* Game HUD Controllers */
        .btn { position: absolute; width: 70px; height: 70px; border-radius: 50%; opacity: 0.7; color: white; font-weight: bold; font-size: 26px; display: none; align-items: center; justify-content: center; z-index: 10; }
        #p1-up { bottom: 95px; left: 20px; background: #FF3366; } #p1-down { bottom: 15px; left: 20px; background: #FF3366; }
        #p2-up { bottom: 95px; right: 20px; background: #33CCFF; } #p2-down { bottom: 15px; right: 20px; background: #33CCFF; }
        #p3-up { top: 15px; left: 20px; background: #33FF66; transform: rotate(180deg); } #p3-down { top: 95px; left: 20px; background: #33FF66; transform: rotate(180deg); }
        #p4-up { top: 15px; right: 20px; background: #FFCC33; transform: rotate(180deg); } #p4-down { top: 95px; right: 20px; background: #FFCC33; transform: rotate(180deg); }
        #back-btn { position: absolute; top: 15px; left: calc(50% - 40px); background: #555; padding: 5px 15px; font-size: 12px; border-radius: 5px; display: none; z-index: 20; border: none; color: white; }
      </style>
    </head>
    <body>

      <button id="back-btn" onclick="goToMenu()">⚙️ MENU</button>

      <div id="main-menu" class="menu-layer">
        <div class="menu-title">⚠️ STICK PARTY HUB ⚠️</div>
        <button class="menu-btn" onclick="showScreen('mode-menu')">Quick Play (4P)</button>
        <button class="menu-btn" style="background:#444; box-shadow:none;">Options</button>
      </div>

      <div id="mode-menu" class="menu-layer" style="display:none;">
        <div class="menu-title">Select Arena Mode</div>
        <div class="grid">
          <div class="card" onclick="startGame('Chaser')">
            <h3>⚡ CHASER</h3>
            <p style="font-size:11px; color:#AAA;">Grab the glowing points first!</p>
          </div>
          <div class="card" style="opacity: 0.5; border-color: #555;">
            <h3>⚽ SOCCER</h3>
            <p style="font-size:11px; color:#666;">Coming Soon in next update!</p>
          </div>
        </div>
        <button class="menu-btn" style="background:#FF3366; font-size:14px; padding:8px 20px; margin-top:20px;" onclick="showScreen('main-menu')">◀ Back</button>
      </div>

      <div class="btn" id="p1-up">▲</div><div class="btn" id="p1-down">▼</div>
      <div class="btn" id="p2-up">▲</div><div class="btn" id="p2-down">▼</div>
      <div class="btn" id="p3-up">▲</div><div class="btn" id="p3-down">▼</div>
      <div class="btn" id="p4-up">▲</div><div class="btn" id="p4-down">▼</div>

      <canvas id="gameCanvas"></canvas>

      <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let gameState = "MENU"; // MENU, PLAYING
        let players = [];
        let dots = [];

        function showScreen(screenId) {
          document.getElementById('main-menu').style.display = screenId === 'main-menu' ? 'flex' : 'none';
          document.getElementById('mode-menu').style.display = screenId === 'mode-menu' ? 'flex' : 'none';
        }

        function toggleControllers(show) {
          const displayVal = show ? 'flex' : 'none';
          document.querySelectorAll('.btn').forEach(b => b.style.display = displayVal);
          document.getElementById('back-btn').style.display = displayVal;
        }

        function startGame(mode) {
          showScreen('');
          toggleControllers(true);
          gameState = "PLAYING";
          
          // Reset custom character configurations
          players = [
            { x: 50, y: canvas.height/2 - 40, color: '#FF3366', size: 20, vy: 0, score: 0, name: "P1" },
            { x: canvas.width - 70, y: canvas.height/2 - 40, color: '#33CCFF', size: 20, vy: 0, score: 0, name: "P2" },
            { x: 120, y: canvas.height/2 + 40, color: '#33FF66', size: 20, vy: 0, score: 0, name: "P3" },
            { x: canvas.width - 140, y: canvas.height/2 + 40, color: '#FFCC33', size: 20, vy: 0, score: 0, name: "P4" }
          ];

          dots = [];
          for(let i=0; i<10; i++) {
            dots.push({ x: Math.random()*(canvas.width-160)+80, y: Math.random()*(canvas.height-160)+80, active: true });
          }
        }

        function goToMenu() {
          toggleControllers(false);
          gameState = "MENU";
          showScreen('main-menu');
        }

        // Hook up touch events
        function setMovement(id, pIdx, speed) {
          const el = document.getElementById(id);
          el.addEventListener('touchstart', (e) => { e.preventDefault(); if(players[pIdx]) players[pIdx].vy = speed; });
          el.addEventListener('touchend', () => { if(players[pIdx]) players[pIdx].vy = 0; });
        }
        setMovement('p1-up', 0, -6); setMovement('p1-down', 0, 6);
        setMovement('p2-up', 1, -6); setMovement('p2-down', 1, 6);
        setMovement('p3-up', 2, -6); setMovement('p3-down', 2, 6);
        setMovement('p4-up', 3, -6); setMovement('p4-down', 3, 6);

        function gameLoop() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (gameState === "PLAYING") {
            // Render targets
            dots.forEach(dot => {
              if(dot.active) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 8, 0, Math.PI*2);
                ctx.fillStyle = '#FFF';
                ctx.fill();
              }
            });

            // Update stick fighters
            players.forEach((p, index) => {
              p.y += p.vy;
              if(p.y < 10) p.y = 10;
              if(p.y > canvas.height - p.size - 10) p.y = canvas.height - p.size - 10;

              // Draw stickman head & torso box
              ctx.fillStyle = p.color;
              ctx.fillRect(p.x, p.y, p.size, p.size);
              ctx.fillStyle = '#FFF';
              ctx.font = '10px Arial';
              ctx.fillText(p.name, p.x + 4, p.y - 4);

              // Check collisions
              dots.forEach(dot => {
                if(dot.active && Math.hypot(p.x - dot.x, p.y - dot.y) < p.size + 8) {
                  dot.active = false;
                  p.score++;
                  setTimeout(() => {
                    dot.x = Math.random()*(canvas.width-160)+80;
                    dot.y = Math.random()*(canvas.height-160)+80;
                    dot.active = true;
                  }, 2000);
                }
              });

              // Show continuous arcade scoring panel
              ctx.fillStyle = p.color;
              ctx.font = 'bold 14px sans-serif';
              ctx.fillText(p.name + ': ' + p.score, 30 + (index * 85), 30);
            });
          }

          requestAnimationFrame(gameLoop);
        }
        gameLoop();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']}
        source={{ html: gameHTML }}
        style={styles.gameView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  gameView: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  splashContainer: { flex: 1, backgroundColor: '#0F0F13', justifyContent: 'center', alignItems: 'center' },
  splashSub: { fontSize: 11, color: '#00E676', letterSpacing: 3, marginBottom: 8, fontWeight: 'bold' },
  splashTitle: { fontSize: 44, fontWeight: '900', color: '#FFF', textTransform: 'uppercase' },
  splashTitleSub: { fontSize: 22, fontWeight: '700', color: '#FF3366', textTransform: 'uppercase', letterSpacing: 5, marginTop: -4 },
  divider: { width: 50, height: 4, backgroundColor: '#00E676', marginVertical: 25, borderRadius: 2 },
  developerText: { fontSize: 15, color: '#7E7E86', fontWeight: '500' }
});
