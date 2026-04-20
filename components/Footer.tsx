import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTiktok, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    return (
        <div className=' mx-10 lg:mx-20 my-5 body print:hidden ' >
            <hr className='my-5 border-gray-500 ' />

            <div className='lg:flex lg:justify-end justify-center' >
                <div className='text-start text-sm' >© 2026 Mohammed B | ronneyDev. All rights rederved.</div>

                <div>
                    <div className='text-white mx-20 w-2/3 flex justify-between' >
                        <a className='mx-1v' href="https://www.facebook.com/benhammada.mohamed/" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faFacebook} size='xl' />
                        </a>
                        <a className='mx-1' href="https://instagram.com/rney.mo/" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faInstagram} size='xl' />
                        </a>
                        <a className='mx-1' href="https://www.tiktok.com/@rney.mo" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faTiktok} size='xl' />
                        </a>
                        <a className='mx-1 ' href="https://wa.me/+213795972858" target="_blank" rel="noopener noreferrer">
                            <FontAwesomeIcon icon={faWhatsapp} size='xl' />
                        </a>

                    </div>
                </div>
            </div>
        </div>
    )
}
export default Footer