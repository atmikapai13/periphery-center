import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="about-main-footer">
      <div className="about-main-footer-inner">
        <div className="about-footer-contact">
          <button
            className="about-footer-newsletter-btn"
            onClick={() => (document.getElementById('brevo-modal') as HTMLDialogElement)?.showModal()}
          >
            Subscribe to our newsletter
          </button>
          <span className="about-footer-divider">|</span>
          <a className="about-footer-email" href="mailto:hello@peripherycenter.com">hello@peripherycenter.com</a>
        </div>
        <div className="about-footer-titles">
          <h1 className="about-title">The Periphery Center</h1>
          <h1 className="about-title" style={{ fontWeight: 300, letterSpacing: '0.05em', fontSize: '0.8rem' }}>A Living Culture Lab</h1>
        </div>
      </div>

      <dialog
        id="brevo-modal"
        style={{
          border: 'none',
          borderRadius: '12px',
          padding: '0',
          maxWidth: '540px',
          width: '90%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          backgroundColor: '#000000',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <button
          onClick={() => (document.getElementById('brevo-modal') as HTMLDialogElement)?.close()}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#fff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          ✕
        </button>
        <iframe
          width="100%"
          height="490"
          src="https://2c936e86.sibforms.com/v2/serve/MUIFAGZ5TIrpsi4D4Rd2DllBiG_U2RgtNxkCv81FlswvCw8e0TAlaNJRxhOVtKloxJ8aJCdLZAPPHdSrwqnGsJ8bCiFCdkyxZw9fHhJ51Pw_sc0Iu1sqs5KojcqvcWv1GG6aMMN49b9P2y95LZ-_zWVueMHiEA6j3ywm2iYaC9bTgxWh5q_P2ES0JpS7JNrIhDKHtFYAG-oQqJoknw=="
          allowFullScreen
          style={{ display: 'block', border: 'none', width: '100%' }}
        />
      </dialog>
    </footer>
  );
}

export default Footer;
