import React from 'react';
import { Link } from 'react-router-dom';

const Products = ({ products, cartItems, createLineItem, updateLineItem })=> {
  return (
    
    <div >
      <h2>Products</h2>
      
        {
          products.map( product => {
            const cartItem = cartItems.find(lineItem => lineItem.product_id === product.id);
            return  (
            <div key={ product.id }  className='productContainer'>
              <Link to={`/porducts/${product.id}`} >
              <h2 >{ product.name }</h2>
              <p>Price: ${product.price/100}</p>
              
                <img className='productPictures' src={product.img}/>
                <p>{product.description}</p>
              
                {
                  cartItem ? <button onClick={ ()=> updateLineItem(cartItem)}>Add Another</button>: <button onClick={ ()=> createLineItem(product)}>Add</button>
                }
              </Link>
              </div>
            );
          })
        }
     
    </div>
  );
};

export default Products;
