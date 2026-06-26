import { useState, useEffect, useRef, type MouseEvent } from 'react';
import '../styles/AboutPage.css';
import BorromeanKnot from '../components/BorromeanKnot';
import Tetrahedron from '../components/Tetrahedron';
import DecryptingImage from '../components/DecryptingImage';
import VideoPlaylist from '../components/VideoPlaylist';

// Import all images from assets/pictures
import img1 from '../assets/pictures/IMG_20160831_125703.jpg';
import img2 from '../assets/pictures/IMG_20160902_180353.jpg';
import img3 from '../assets/pictures/IMG_20160904_121250.jpg';
import img4 from '../assets/pictures/IMG_20170417_103442.jpg';
import img5 from '../assets/pictures/IMG_20170417_104107.jpg';
import img6 from '../assets/pictures/PXL_20231119_024224867.MP.jpg';
import img7 from '../assets/pictures/PXL_20240921_030606796.MP.jpg';
import img8 from '../assets/pictures/PXL_20260131_185112498.jpg';
import img9 from '../assets/pictures/PXL_20260131_190133410.jpg';
import img10 from '../assets/pictures/PXL_20260131_190741872.jpg';
import img11 from '../assets/pictures/PXL_20260131_192544486.jpg';
import img12 from '../assets/pictures/PXL_20260131_192832486.jpg';
import img13 from '../assets/pictures/PXL_20260131_200123704.jpg';
import img14 from '../assets/pictures/PXL_20260228_192502898.jpg';
import img15 from '../assets/pictures/PXL_20260301_040011833.MP.jpg';

const slideshowImages = [
  img1, img2, img3, img4, img5, img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15
];

function AboutPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(
    () => Math.floor(Math.random() * slideshowImages.length)
  );
  // Reveal duration for the *current* image; set when the image changes so it
  // never restarts mid-animation. Default 5s (the un-hovered speed).
  const [revealDuration, setRevealDuration] = useState(5000);
  // Hover speed multiplier driven by cursor X over the image: 0.5x (far left)
  // → 1x (center) → 2x (far right). 1x when not hovering. A ref so cursor moves
  // don't trigger re-renders. Read live by the slideshow ticker below.
  const speedRef = useRef(1);

  // Slideshow effect - advance to a random image (no immediate repeat). Driven
  // by a progress accumulator that fills at the current hover speed, so moving
  // the cursor right speeds the whole cycle up and left slows it down.
  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const CYCLE_MS = 8000; // 5s decrypt reveal + 3s holding sharp, at 1x
    const TICK = 50;
    let progress = 0;
    const interval = setInterval(() => {
      progress += TICK * speedRef.current;
      if (progress < CYCLE_MS) return;
      progress = 0;
      // Snapshot the speed so this image's reveal stays proportional to its hold.
      const speed = speedRef.current;
      setRevealDuration(Math.round(5000 / speed));
      setCurrentImageIndex((prevIndex) => {
        // Pick uniformly among all images except the current one.
        let next = Math.floor(Math.random() * (slideshowImages.length - 1));
        if (next >= prevIndex) next += 1;
        return next;
      });
    }, TICK);

    return () => clearInterval(interval);
  }, []);

  // Map cursor X within the image to the speed multiplier (geometric so center
  // is exactly 1x): left edge → 0.5x, center → 1x, right edge → 2x.
  const handleSlideshowMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    speedRef.current = Math.pow(2, 2 * f - 1);
  };
  const handleSlideshowMouseLeave = () => {
    speedRef.current = 1;
  };
  return (
    <div className="about-page-new">
      {/* Binary background decoration */}
      <div className="binary-background"></div>

      {/* Content sections */}
      <div className="about-content" style={{ position: 'relative', zIndex: 10 }}>

        <p className="about-description">
          <strong>The Periphery Center</strong> is a <strong>living culture lab:</strong> a practice focused on building community through the creative exploration of technology, space and ritual as our cultural medium.
        </p>

        {/* Hover wrapper: cursor X position over the image scales the slideshow
            speed (right = faster, left = slower). DecryptingImage doesn't
            forward DOM events, so the handlers live on this wrapper. */}
        <div
          className="slideshow-hover"
          onMouseMove={handleSlideshowMouseMove}
          onMouseLeave={handleSlideshowMouseLeave}
        >
          <DecryptingImage
            src={slideshowImages[currentImageIndex]}
            duration={revealDuration}
            direction={currentImageIndex % 2 === 0 ? 'out' : 'in'}
            animateOnMount={true}
            className="content-background-image"
          />
        </div>

        {/* Core Principles Section */}
        <section className="principle-section knot-section">
          <div className="principle-section-content">
            <h2 className="principle-section-title">Core Principles</h2>
            <div className="principles-grid">
              <div className="principle principle-left principle-top">
                <h3 className="principle-heading">Senses &amp; Physics.</h3>
                <p className="principle-text">
                  All technology explored must engage the body and the spaces we inhabit. We build for the physical world, enhancing human experiences.
                </p>
              </div>
              {/* Rotating chrome Borromean rings, draggable. Top-right cell:
                beside "Human Experience", above "Enrich the Everyday". */}
              <div className="knot-canvas">
                <BorromeanKnot />
              </div>
              <div className="principle principle-right">
                <h3 className="principle-heading">The Everyday &amp; The Elevated.</h3>
                <p className="principle-text">
                  Experiences must connect everyday communal practice with high artistic achievement, without a rigid wall separating them.
                </p>
              </div>
              <div className="principle principle-left principle-bottom">
                <h3 className="principle-heading">Cultivate &amp; Circulate.</h3>
                <p className="principle-text">
                  Our output must physically pull people together, with borders so porous that stepping into the collective is effortless, creating access to enable anyone to sculpt experiences in time and space.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approach Section — same staggered layout as Core Principles */}
        <section className="principle-section tetra-section">
          <div className="principle-section-content">
            <h2 className="principle-section-title">OUR PRACTICE</h2>
            <div className="principles-grid">
              <div className="principle principle-left principle-top">
                <h3 className="principle-heading">Think with your Hands.</h3>
                <p className="principle-text">
                  We prioritize rapid proof-of-concept development and embrace a comfort with failure. We build it, test it on the floor, and see what breaks.
                </p>
              </div>
              {/* Rotating chrome tetrahedron, draggable. Positioned via .tetra-canvas
                (desktop: lower-left cell; mobile: backdrop behind the text). */}
              <div className="tetra-canvas">
                <Tetrahedron />
              </div>
              <div className="principle principle-right">
                <h3 className="principle-heading">Rhythm Over Rules.</h3>
                <p className="principle-text">
                  Innovation thrives on rituals: humanized, structured time. The daily, weekly, and monthly happenings provide the positive pressure and heartbeat needed to sustain the community.
                </p>
              </div>
              <div className="principle principle-left principle-bottom">
                <h3 className="principle-heading">Lived, Not Lectured.</h3>
                <p className="principle-text">
                  The environment and the practices are designed for exploration where understanding emerges through a community's active relationship with the medium.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Make — full-bleed video with the four mechanics overlaid,
            blending into the footage (mix-blend-mode: exclusion). */}
        <section className="principle-section build-section">
          <VideoPlaylist />
          <h2 className="principle-section-title build-title">WHAT WE MAKE</h2>
          <div className="build-grid">
            <div className="principle">
              <h3 className="principle-heading">Exchange Over Extraction.</h3>
              <p className="principle-text">
                While consumerism acts like a living medium, its creative access is gatekept. We distribute value through shared creation and non-consumption-based models, ensuring the creative act belongs to the community.
              </p>
            </div>
            <div className="principle">
              <h3 className="principle-heading">Low Floor, No Ceiling.</h3>
              <p className="principle-text">
                What we build must be intuitive enough for a stranger to grasp instantly, yet deep and expressive enough for a dedicated artist to achieve true virtuosity.
              </p>
            </div>
            <div className="principle">
              <h3 className="principle-heading">Temporal, not Fixed.</h3>
              <p className="principle-text">
                We acknowledge the human relationship with time—experiences that unfold, shift states, and naturally evolve, rather than trapping people in a perpetual loop of spectacle. A living medium should not be beholden to a captured moment.
              </p>
            </div>

            <div className="principle">
              <h3 className="principle-heading">Watch. Join. Make.</h3>
              <p className="principle-text">
                Enabling people to move fluidly between observing, participating, and creating. The roles are not locked.
              </p>
            </div>

          </div>
        </section>

      </div> {/* Closes about-content */}

      {/* Footer Section */}
      <footer className="about-main-footer">
        <div className="about-main-footer-inner">
          <a className="about-footer-email" href="mailto:hello@peripherycenter.com">hello@peripherycenter.com</a>
          <div className="about-footer-titles">
            <h1 className="about-title">The Periphery Center</h1>
            <h1 className="about-title" style={{ fontWeight: 300, letterSpacing: '0.05em', fontSize: '0.8rem' }}>A Living Culture Lab</h1>
          </div>
        </div>

        {/* 1. The Clean Trigger Button */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <button
            onClick={() => (document.getElementById('brevo-modal') as HTMLDialogElement)?.showModal()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Subscribe to Newsletter
          </button>
        </div>

        {/* 2. The Hidden Pop-up Modal */}
        <dialog
          id="brevo-modal"
          style={{
            border: 'none',
            borderRadius: '12px',
            padding: '0',              // Wipes out the thick white border
            maxWidth: '540px',          // Perfectly matches the width of the Brevo form
            width: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            backgroundColor: '#4c3e3e', // Matches the dark tone of your form layout
            overflow: 'hidden',        // Clips the iframe corners to keep the 12px border radius
            position: 'relative'
          }}
        >
          {/* Close Window Button - Floats over the top-right corner cleanly */}
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

          {/* Your Brevo Code - Height increased to fit the full form and captcha */}
          <iframe
            width="100%"
            height="460"
            src="https://2c936e86.sibforms.com/v2/serve/MUIFAGZ5TIrpsi4D4Rd2DllBiG_U2RgtNxkCv81FlswvCw8e0TAlaNJRxhOVtKloxJ8aJCdLZAPPHdSrwqnGsJ8bCiFCdkyxZw9fHhJ51Pw_sc0Iu1sqs5KojcqvcWv1GG6aMMN49b9P2y95LZ-_zWVueMHiEA6j3ywm2iYaC9bTgxWh5q_P2ES0JpS7JNrIhDKHtFYAG-oQqJoknw=="
            allowFullScreen
            style={{ display: 'block', border: 'none', width: '100%' }}
          ></iframe>
        </dialog>
      </footer>
    </div>
  );
}

export default AboutPage;