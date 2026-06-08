import { useEffect, useState } from 'react';
import '../styles/AboutPage.css';
import lacanTriangle from '../assets/Lacan_triangle_reinterpreted.png';
import logo from '../assets/logo.png';
import Footer from '../components/Footer';

function AboutPage() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = 400;

      const progress = Math.min(1, scrollPosition / maxScroll);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate logo size: 350px -> 100px
  const logoHeight = 350 - (scrollProgress * 250); // 350 - 230 = 120

  return (
    <div className="about-page">
      <div className="about-header">
        <img
          src={logo}
          alt="The Periphery Center"
          className="about-logo logo-fixed"
          style={{
            height: `${logoHeight}px`,
          }}
        />
      </div>
      <div style={{ height: `${logoHeight + 5}px` }} />
      <h2 className="section-title">MANIFESTO</h2>
      <div className="about-content">
          <p>The Periphery Center is a <strong>living culture lab.</strong></p>

          <p className="tight-bottom">Up until the 20th century, religion defined culture.</p>
          <p>Now, capitalism and consumerism control much of it, with digital media as its vehicle.</p>

          <p className="tight-bottom">But, this is very sadly not an embodied experience.</p>
          <p>(except perhaps TikTok dances?)</p>

          <p>The Periphery Center believes that <strong>creativity is a core element of a healthy community.</strong></p>

          <p className="tight-bottom">Through workshops, events, and festivals with artists, technologists, and the masses, </p>
          <p>we cultivate a <strong>Third Space for the Sociotechnical Realm.</strong></p>

          
      </div>

      <h2 className="section-title" style={{ marginTop: '3.5rem' }}>WHAT WE BUILD</h2>

      <div className="build-section">
          <figure className="diagram-figure">
            <img src={lacanTriangle} alt="Lacan triangle reinterpreted diagram" className="diagram-image" />
            <figcaption className="diagram-caption">*Inspired by the Lacanian RSI Triad</figcaption>
          </figure>

          <div className="build-text">
            <h3>Ritualized & the Sublime</h3>
            <p>
              Experiences must connect everyday communal practice with high artistic achievement, without a rigid wall separating them. Think of habitual practices that are rooted in ritual, reaching for the sublime.
            </p>
            <h3>Collective by Default</h3>
            <p>
              We build for the "we," not the "me." Our output must physically pull people together, with borders so porous that stepping into the collective is effortless. If an experience can be fully realized by one person alone, or requires an invite to join the group, it does not belong here.
            </p>
            <h3>Radical Embodiment</h3>
            <p>
              All technology explored here must engage the body and physical co-presence. We build for the physical world, enhancing human experiences to counter disembodied media.
            </p>
          </div>
      </div>

      <h2 className="section-title" style={{ marginTop: '3.5rem' }}>HOW WE OPERATE</h2>

      <div className="operate-grid">
          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  The tools we build must be intuitive enough for a stranger to grasp instantly, yet deep and expressive enough for a dedicated artist to achieve true virtuosity.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Low Floor, No Ceiling</h3>
              <p className="card-tagline">Immediate Entry, Endless Virtuosity</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  The environment allows people to move fluidly between observing, participating, and creating. The roles are not locked.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">The Open Floor</h3>
              <p className="card-tagline">Watch. Join. Make.</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  We prioritize rapid proofs of concept and embrace a comfort with failure. We don't write speculative white papers; we build it, test it on the floor, and see what breaks.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Think With Your Hands</h3>
              <p className="card-tagline">Predict Through Doing</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  Innovation thrives on humanized, structured time. The daily, weekly, and monthly happenings provide the positive pressure and heartbeat needed to sustain the community.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Rhythm Over Rules</h3>
              <p className="card-tagline">Rituals, Not Process</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  Culture cannot be assigned. The environment is designed for exploration where understanding emerges through a community's active relationship with the medium.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Emergent, Not Dictated</h3>
              <p className="card-tagline">Lived, Not Lectured</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  While consumerism acts like a living medium, its creative pole is gatekept. We distribute value through shared creation and non-consumption-based models, ensuring the generative act belongs to the community.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Exchange Over Extraction</h3>
              <p className="card-tagline">Culture, Not Commodities</p>
            </div>
          </div>

          <div className="operate-card">
            <div className="card-image">
              <div className="card-overlay">
                <p className="card-description">
                  A living medium should not be slave to a captured moment. We acknowledge the human relationship with time—experiences that unfold, shift states, and naturally conclude, rather than trapping people in a perpetual loop of spectacle.
                </p>
              </div>
            </div>
            <div className="card-info">
              <h3 className="card-title">Temporal, Not Fixed</h3>
              <p className="card-tagline">Design for the Moment</p>
            </div>
          </div>
      </div>

      <Footer />
    </div>
  );
}

export default AboutPage;
