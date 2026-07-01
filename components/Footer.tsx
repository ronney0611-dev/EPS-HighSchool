import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTiktok, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
        <footer className='print:hidden max-w-7xl mx-auto w-full px-6 pb-8 font-["Noto_Kufi_Arabic","Cairo",sans-serif] bg-black text-white' >
            {/* Divider line */}
            <hr className='my-5 border-gray-300' />

            {/* Layout Container */}
            <div className='flex flex-col mx-10 sm:flex-row justify-between items-center gap-4 text-center sm:text-start' >
                
                {/* Copyright Text */}
                <div className='text-gray-500 text-sm tracking-wide order-2 sm:order-1' dir="ltr">
                    © 2026 BENHAMADA M | ronneyDev. All rights reserved.
                </div>
                
                {/* Social Media Links Container */}
                <div className='order-1 sm:order-2'>
                    <div className='flex items-center gap-4 text-gray-500' >
                        <a 
                            className='hover:text-blue-600 transition-colors p-1' 
                            href="https://www.facebook.com/benhammada.mohamed/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                        >
                            <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 block" />
                        </a>
                        <a 
                            className='hover:text-pink-600 transition-colors p-1' 
                            href="https://instagram.com/rney.mo/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 block" />
                        </a>
                        <a 
                            className='hover:text-white transition-colors p-1' 
                            href="https://www.tiktok.com/@rney.mo" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                        >
                            <FontAwesomeIcon icon={faTiktok} className="w-5 h-5 block" />
                        </a>
                        <a 
                            className='hover:text-green-500 transition-colors p-1' 
                            href="https://wa.me/+213795972858" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 block" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;