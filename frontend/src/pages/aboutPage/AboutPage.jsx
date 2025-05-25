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
                <small>Where to find us?</small>
                <h1 className="titles">Call us on:</h1>
                <p>0700000000</p>
                <p>0700000000</p>
                <p>0700000000</p>
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
    </section>
}