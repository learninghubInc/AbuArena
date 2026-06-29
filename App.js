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

  const gameHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { margin: 0; background: #0F0F13; overflow: hidden; font-family: 'Arial Black', sans-serif; user-select: none; color: white; }
        canvas { display: block; margin: 0 auto; background: #16161E; }
        
        .menu-layer { position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 15, 19, 0.95); z-index: 100; }
        .menu-title { font-size: 38px; color: #FFCC33; text-shadow: 3px 3px #FF3366; margin-bottom: 30px; letter-spacing: 2px; text-transform: uppercase; }
        .menu-btn { background: linear-gradient(135deg, #00E676, #00B0FF); border: none; padding: 15px 40px; color: white; font-size: 20px; font-weight: bold; border-radius: 50px; margin: 10px; cursor: pointer; box-shadow: 0 5px 15px rgba(0,230,118,0.4); text-transform: uppercase; }
        
        .grid { display: flex; gap: 20px; }
        .card { background: #22222E; border: 3px solid #33CCFF; padding: 20px; border-radius: 15px; text-align: center; width: 140px; }
        
        /* 🚨 CIRCULAR JOYSTICK HOUSINGS 🚨 */
        .joystick-container { position: absolute; width: 90px; height: 90px; background: rgba(255, 255, 255, 0.1); border: 3px solid rgba(255, 255, 255, 0.3); border-radius: 50%; display: none; justify-content: center; align-items: center; z-index: 10; touch-action: none; }
        .joystick-knob { width: 35px; height: 35px; border-radius: 50%; position: absolute; transition: transform 0.05s linear; }
        
        /* Position one circle controller in each corner */
        #joy-p1 { bottom: 20px; left: 20px; border-color: #FF3366; }
        #joy-p1 .joystick-knob { background: #FF3366; }
        
        #joy-p2 { bottom: 20px; right: 20px; border-color: #33CCFF; }
        #joy-p2 .joystick-knob { background: #33CCFF; }
        
        #joy-p3 { top: 20px; left: 20px; border-color: #33FF66; }
        #joy-p3 .joystick-knob { background: #33FF66; }
        
        #joy-p4 { top: 20px; right: 20px; border-color: #FFCC33; }
        #joy-p4 .joystick-knob { background: #FFCC33; }

        #back-btn { position: absolute; top: 15px; left: calc(50% - 40px); background: #555; padding: 5px 15px; font-size: 12px; border-radius: 5px; display: none; z-index: 120; border: none; color: white; }
      </style>
    </head>
    <body>

      <button id="back-btn" onclick="goToMenu()">⚙️ MENU</button>

      <div id="main-menu" class="menu-layer">
        <div class="menu-title">⚠️ STICK PARTY HUB ⚠️</div>
        <button class="menu-btn" onclick="showScreen('mode-menu')">Quick Play (4P)</button>
      </div>

      <div id="mode-menu" class="menu-layer" style="display:none;">
        <div class="menu-title">Select Arena Mode</div>
        <div class="grid">
          <div class="card" onclick="startGame('Chaser')">
            <h3>⚡ CHASER</h3>
            <p style="font-size:11px; color:#AAA;">Run with circular joystick controls!</p>
          </div>
        </div>
      </div>

      <div class="joystick-container" id="joy-p1"><div class="joystick-knob" id="knob-p1"></div></div>
      <div class="joystick-container" id="joy-p2"><div class="joystick-knob" id="knob-p2"></div></div>
      <div class="joystick-container" id="joy-p3"><div class="joystick-knob" id="knob-p3"></div></div>
      <div class="joystick-container" id="joy-p4"><div class="joystick-knob" id="knob-p4"></div></div>

      <canvas id="gameCanvas"></canvas>

      <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let gameState = "MENU"; 
        let players = [];
        let dots = [];

        function showScreen(screenId) {
          document.getElementById('main-menu').style.display = screenId === 'main-menu' ? 'flex' : 'none';
          document.getElementById('mode-menu').style.display = screenId === 'mode-menu' ? 'flex' : 'none';
        }

        function toggleControllers(show) {
          const displayVal = show ? 'flex' : 'none';
          document.querySelectorAll('.joystick-container').forEach(b => b.style.display = displayVal);
          document.getElementById('back-btn').style.display = displayVal;
        }

        function startGame(mode) {
          showScreen('');
          toggleControllers(true);
          gameState = "PLAYING";
          
          players = [
            { x: 100, y: canvas.height/2, color: '#FF3366', size: 20, vx: 0, vy: 0, score: 0, name: "P1" },
            { x: canvas.width - 120, y: canvas.height/2, color: '#33CCFF', size: 20, vx: 0, vy: 0, score: 0, name: "P2" },
            { x: 180, y: canvas.height/2, color: '#33FF66', size: 20, vx: 0, vy: 0, score: 0, name: "P3" },
            { x: canvas.width - 200, y: canvas.height/2, color: '#FFCC33', size: 20, vx: 0, vy: 0, score: 0, name: "P4" }
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

        // Circular 2D Input tracking for joysticks
        function bindJoystick(containerId, knobId, playerIdx) {
          const container = document.getElementById(containerId);
          const knob = document.getElementById(knobId);
          const maxDist = 30; // boundaries of outer circle

          function handleTouch(e) {
            e.preventDefault();
            if (gameState !== "PLAYING" || !players[playerIdx]) return;
            
            const touch = e.touches[0];
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let deltaX = touch.clientX - centerX;
            let deltaY = touch.clientY - centerY;
            let distance = Math.hypot(deltaX, deltaY);

            if (distance > maxDist) {
              deltaX = (deltaX / distance) * maxDist;
              deltaY = (deltaY / distance) * maxDist;
            }

            knob.style.transform = \`translate(\${deltaX}px, \${deltaY}px)\`;
            
            // Set speed velocity based on circle pull direction
            players[playerIdx].vx = (deltaX / maxDist) * 5;
            players[playerIdx].vy = (deltaY / maxDist) * 5;
          }

          container.addEventListener('touchstart', handleTouch);
          container.addEventListener('touchmove', handleTouch);
          container.addEventListener('touchend', () => {
            knob.style.transform = 'translate(0px, 0px)';
            if(players[playerIdx]) {
              players[playerIdx].vx = 0;
              players[playerIdx].vy = 0;
            }
          });
        }

        // Activate the circular dynamic joysticks
        bindJoystick('joy-p1', 'knob-p1', 0);
        bindJoystick('joy-p2', 'knob-p2', 1);
        bindJoystick('joy-p3', 'knob-p3', 2);
        bindJoystick('joy-p4', 'knob-p4', 3);

        function gameLoop() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (gameState === "PLAYING") {
            dots.forEach(dot => {
              if(dot.active) {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 8, 0, Math.PI*2);
                ctx.fillStyle = '#FFF';
                ctx.fill();
              }
            });

            players.forEach((p, index) => {
              // Move on both axes X and Y now
              p.x += p.vx;
              p.y += p.vy;

              if(p.x < 10) p.x = 10;
              if(p.x > canvas.width - p.size - 10) p.x = canvas.width - p.size - 10;
              if(p.y < 10) p.y = 10;
              if(p.y > canvas.height - p.size - 10) p.y = canvas.height - p.size - 10;

              ctx.fillStyle = p.color;
              ctx.fillRect(p.x, p.y, p.size, p.size);
              ctx.fillStyle = '#FFF';
              ctx.fillText(p.name, p.x + 4, p.y - 4);

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

              ctx.style = p.color;
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
