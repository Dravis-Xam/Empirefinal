import React from "react";
import './DiscountCard.css';

export default function DiscountCard() {
    return <div className="DiscountCard">
        <h1 className="catchline">Enjoy Incredible Discounts</h1>
        <div className="discountOfferContainer">
            <div className="discountOfferCard">
                <h3>Easter Festive Deals</h3>
                <h4>Limited-time offer</h4> . <small>14 days remaining</small>
                <p>Discounts of upto 15% off</p>
                <button>Get</button>
            </div>
            <div className="discountOfferCard">
                <h3>Exclusive customer Discounts</h3>
                <h4>Limited-time offer</h4> . <small>24 days remaining</small>
                <p>Discounts of upto 11% off</p>
                <button>Get</button>
            </div>
        </div>
    </div>
}