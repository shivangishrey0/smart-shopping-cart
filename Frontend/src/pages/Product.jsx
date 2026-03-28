import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useParams } from 'react-router-dom';
import ProductDisplay from '../components/ProductDisplay/ProductDisplay';
import Breadcrum from '../components/Breadcrum/Breadcrum';
import DescriptionBox from '../components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../components/RelatedProducts/RelatedProducts';
const Product = () => {
  const { all_product, cartItems } = useContext(ShopContext);
  const { productId } = useParams();

  const product = all_product?.find((e) => e.id === Number(productId));
  const productQuantity = cartItems[productId];

  if (!product) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Product not found or loading...</div>;
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} quantity={productQuantity} />
      <DescriptionBox/>
      <RelatedProducts/>
    </div>
  );
};

export default Product;