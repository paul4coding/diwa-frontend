import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import './FloatingContact.css';

const FloatingContact = () => {
    return (
        <Link to="/contact" className="floating-contact-container" title="Des questions ? Contactez-nous">
            <div className="floating-tooltip">
                Des questions ? <br /> <span>Contactez-nous</span>
            </div>
            <div className="floating-icon-box">
                <HelpCircle size={26} strokeWidth={1.5} />
            </div>
            <div className="floating-pulse"></div>
        </Link>
    );
};

export default FloatingContact;
