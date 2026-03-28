import React from "react";
import './DescriptionBox.css'
const DescriptionBox = () =>{
    return(
        <div className='descriptionbox'>
            <div className="card">
                <div className="descriptionbox-navigator">
                    <div className="descriptionbox-nav-box">Description</div>
                    <div className="descriptionbox-nav-box fade">Reviews (122)</div>
                </div>
                <div className="descriptionbox-description">
                    <p>
                        Welcome to <strong>[Your Store Name]</strong> — your trusted online shopping destination. We are an innovative e-commerce
                        platform offering a wide range of products including fashion, accessories, electronics, and more — all in one place. Our
                        mission is to provide a seamless shopping experience with high-quality products, secure payments, and fast delivery right
                        to your doorstep. Explore our collections, discover exciting deals, and enjoy a convenient and reliable way to shop online.
                    </p>

                    <p>
                        Our customer-first approach means we continuously update our collections and improve the experience. If you have questions
                        about a product, shipping, or returns, please reach out to our support team — we’re happy to help.
                    </p>
                </div>
            </div>
        </div>
    )
}
export default DescriptionBox