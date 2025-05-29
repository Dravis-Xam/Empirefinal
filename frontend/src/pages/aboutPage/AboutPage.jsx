import MoveToTop from "../components/buttons/movetotop/MoveToTop";
import Header from "../components/sections/header/Header";
import DirectoryNavigation from "../components/sections/nav/directoryNav/DirectoryNavigation";
import './AboutPage.css';

export default function AboutPage() {
    return <section>
        <Header />
        <DirectoryNavigation />
        <div className="aboutUsSection">
            <div>
                <small>Who are we?</small>
                <h1 className="titles">Empire Hub Phones</h1>
                <p>The fastest growing dealer of smart phones and other electronic gadgets.</p>
            </div>
            <div>
                <small>What do we do?</small>
                <h1 className="titles">We Sell Phones</h1>
                <p> - of all types at affordable prices.</p>
            </div>
            <div>
                <small>How do we do it?</small>
                <h1 className="titles">We ensure Quality and Reliable Service.</h1>
                <p>By making sure our clients get Quality devices in Quality time.</p>
            </div>
            <div>
                <small>How to reach us?</small>
                <h1 className="titles">Call us on:</h1>
                <p>0700029555</p>
                <p>0700023555</p>
                <p>0711489056</p>
                <p>empirehub254@gmail.com</p>
            </div>
            <div>
                <small>Where to find us?</small>
                <h1 className="titles">We are at:</h1>
                <p>Moi avenue, bazaar plaza, floor M1, Unit 3, Shop A2</p>
            </div>
            <div>
                <small>For comments, support or queries </small>
                <h1 className="titles">Reach us at:</h1>
                <p><i>Facebook</i></p>
                <p><i>Instagram</i></p>
                <p><i>Whatsapp</i></p>
            </div>
        </div>
        <div className="valuesContainer">
            <h1>Our Values</h1>
            <p>
                <span>
                <strong>Excellence</strong><br />
                <small>Provide quality and realiable service.</small><br /><br /></span><span>
                <strong>Time sensitive</strong><br />
                <small>Ensure we deliver on time</small></span><br /><br /><span>
                <strong>Motivated</strong><br /><small>We are highly motivated to serve you.</small></span>
            </p>
        </div>
        <MoveToTop />
    </section>
}