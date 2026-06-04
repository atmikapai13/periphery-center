import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="logo-container">
          <img src="/Eye.png" alt="Eye logo" className="eye-logo" />
        </div>

        <div className="text-container">
          <h1 className="title">
            <span className="title-line">The</span>
            <span className="title-line">Periphery</span>
            <span className="title-line">Center</span>
          </h1>
          <p className="subtitle">A Living Culture Lab</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
