import React from 'react';
import { FaDesktop, FaWifi, FaGamepad } from 'react-icons/fa';

function App() {
  return (
      <div className="bg-dark">
          <div className="container d-flex align-items-center justify-content-center text-center text-white" style={{ backgroundImage: 'url(play_together.svg)', height: '300px', width: '100vw' }}>
              <div className="align-self-center">
                  <h1 className="z-2 rounded-3">ИГРАЙ С НАМИ</h1>
                  <h2 className="align-self-center">УЖЕ СЕГОДНЯ</h2>
              </div>
          </div>
          <div className="container-fluid text-center text-white mt-3">
              <h1 className="mb-3">НАШИ ПРЕИМУЩЕСТВА</h1>
              <div className="row">
                  <div className="col">
                      <FaDesktop color="#ffc107" size={100} />
                      <p>Современные и мощные компьютеры</p>
                  </div>
                  <div className="col">
                      <FaWifi color="#ffc107" size={100} />
                      <p>Стабильный и быстрый интернет</p>
                  </div>
                  <div className="col">
                      <FaGamepad color="#ffc107" size={100} />
                      <p>Удобные и качественные девайсы</p>
                  </div>
              </div>
          </div>
      </div>

  );
}

export default App;
