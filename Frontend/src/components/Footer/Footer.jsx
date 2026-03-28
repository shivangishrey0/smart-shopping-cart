import React, { useState } from "react";
import './Footer.css'
import footer_logo from '../Assets/logo_big.png'
import instagram_icon from '../Assets/instagram_icon.png'
import pintester_icon from '../Assets/pintester_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
    const [showOffice, setShowOffice] = useState(false);
    const [showContact, setShowContact] = useState(false);

    // Handle click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.info-container')) {
                setShowOffice(false);
                setShowContact(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className='footer'>
            <div className="footer-logo">
                <img src={footer_logo} alt=""/>
                <p>SHOPPER</p>
            </div>
            <ul className='footer-links'>
                <li>Company</li>
                <li>Products</li>
                <li className="info-container">
                    <span onDoubleClick={() => setShowOffice(false)} 
                          onClick={(e) => { e.stopPropagation(); setShowOffice(!showOffice); }}>
                        Offices
                    </span>
                    {showOffice && (
                        <div className="info-tooltip">
                            <p>Delhi Office:</p>
                            <p>123 Cyber Hub, Sector 15</p>
                            <p>New Delhi, 110001</p>
                        </div>
                    )}
                </li>
                <li>About</li>
                <li className="info-container">
                    <span onDoubleClick={() => setShowContact(false)}
                          onClick={(e) => { e.stopPropagation(); setShowContact(!showContact); }}>
                        Contact
                    </span>
                    {showContact && (
                        <div className="info-tooltip">
                            <p>Customer Support:</p>
                            <p>+91 98765-43210</p>
                            <p>support@shopper.com</p>
                        </div>
                    )}
                </li>
            </ul>
            <div className='footer-social-icon'>
                <div className='footer-icons-container'>
                    <img src={instagram_icon} alt=""/>
                </div>
                <div className='footer-icons-container'>
                    <img src={pintester_icon} alt=""/>
                </div>
                <div className='footer-icons-container'>
                    <img src={whatsapp_icon} alt=""/>
                </div>
            </div>
            <div className="footer-copyright">
                <hr/>
                <p>Copyright @ 2023 - All Right Reserve</p>
            </div>
        </div>
       
    )
}
export default Footer