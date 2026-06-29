import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Show the "Developed by AbuLearn" screen for 3 seconds when opened
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Intro Splash Screen UI
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashSub}>LAUNCHING GAME...</Text>
        <Text style={styles.splashTitle}>Abu Arena</Text>
        <Text style={styles.splashTitleSub}>Stick Mayhem</Text>
        <View style={styles.divider} />
        <Text style={styles.developerText}>Developed by AbuLearn</Text>
      </View>
    );
  }

  // HTML5 Canvas 4-Player Game Engine
  const gameHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { margin: 0; background: #121212; overflow: hidden; font-family: sans-serif; user-select: none; }
        canvas { display: block; margin: 0 auto; background: #1E1E24; }
        .btn { position: absolute; width: 75px; height: 75px; border-radius: 50%; opacity: 0.7; color: white; font-weight: bold; font-size: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        #p1-up { bottom: 100px; left: 20px; background: #FF3366; }
        #p1-down { bottom: 15px; left: 20px; background: #FF3366; }
        #p2-up { bottom: 100px; right: 20px; background: #33CCFF; }
        #p2-down { bottom: 15px; right: 20px; background: #33CCFF; }
        #p3-up { top: 15px; left: 20px; background: #33FF66; transform: rotate(180deg); }
        #p3-down { top: 100px; left: 20px; background: #33FF66; transform: rotate(180deg); }
        #p4-up { top: 15px; right: 20px; background: #FFCC33; transform: rotate(180deg); }
        #p4-down { top: 100px; right: 20px; background: #FFCC33; transform: rotate(180deg); }
      </style>
    </head>
    <body>

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

        let players = [
          { x: 40, y: canvas.height/2, color: '#FF3366', size: 18, vy: 0, score: 0 },
          { x: canvas.width - 60, y: canvas.height/2, color: '#33CCFF', size: 18, vy: 0, score: 0 },
          { x: 100, y: canvas.height/2, color: '#33FF66', size: 18, vy: 0, score: 0 },
          { x: canvas.width - 120, y: canvas.height/2, color: '#FFCC33', size: 18, vy: 0, score: 0 }
        ];

        let dots = [];
        for(let i=0; i<12; i++) {
          dots.push({ x: Math.random()*(canvas.width-140)+70, y: Math.random()*(canvas.height-140)+70, active: true });
        }

        function setupBtn(id, pIdx, speed) {
          const el = document.getElementById(id);
          el.addEventListener('touchstart', (e) => { e.preventDefault(); players[pIdx].vy = speed; });
          el.addEventListener('touchend', () => { players[pIdx].vy = 0; });
        }

        setupBtn('p1-up', 0, -6); setupBtn('p1-down', 0, 6);
        setupBtn('p2-up', 1, -6); setupBtn('p2-down', 1, 6);
        setupBtn('p3-up', 2, -6); setupBtn('p3-down', 2, 6);
        setupBtn('p4-up', 3, -6); setupBtn('p4-down', 3, 6);

        function update() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw energy points to collect
          dots.forEach(dot => {
            if(dot.active) {
              ctx.beginPath();
              ctx.arc(dot.x, dot.y, 7, 0, Math.PI*2);
              ctx.fillStyle = '#FFFFFF';
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#FFF';
              ctx.fill();
              ctx.shadowBlur = 0; 
            }
          });

          // Update players
          players.forEach((p, idx) => {
            p.y += p.vy;
            if(p.y < 10) p.y = 10;
            if(p.y > canvas.height - p.size - 10) p.y = canvas.height - p.size - 10;

            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            dots.forEach(dot => {
              if(dot.active && Math.hypot(p.x - dot.x, p.y - dot.y) < p.size + 7) {
                dot.active = false;
                p.score += 1;
                setTimeout(() => {
                  dot.x = Math.random()*(canvas.width-140)+70;
                  dot.y = Math.random()*(canvas.height-140)+70;
                  dot.active = true;
                }, 2500);
              }
            });

            // Display Scoreboard HUD
            ctx.fillStyle = p.color;
            ctx.font = 'bold 15px sans-serif';
            ctx.fillText('P' + (idx+1) + ': ' + p.score, 25 + (idx * 75), canvas.height / 2);
          });

          requestAnimationFrame(update);
        }
        update();
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
  container: { flex: 1, backgroundColor: '#121212' },
  gameView: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  splashContainer: { flex: 1, backgroundColor: '#0D0D11', justifyContent: 'center', alignItems: 'center' },
  splashSub: { fontSize: 12, color: '#00E676', letterSpacing: 3, marginBottom: 10, fontWeight: 'bold' },
  splashTitle: { fontSize: 42, fontWeight: '900', color: '#FFF', textTransform: 'uppercase', letterSpacing: 1 },
  splashTitleSub: { fontSize: 24, fontWeight: '700', color: '#FF3366', textTransform: 'uppercase', letterSpacing: 4, marginTop: -5 },
  divider: { width: 60, height: 4, backgroundColor: '#00E676', marginVertical: 30, borderRadius: 2 },
  developerText: { fontSize: 16, color: '#8E8E93', fontWeight: '500', letterSpacing: 1 }
});
