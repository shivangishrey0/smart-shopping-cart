import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../item/item'

export const NewCollections = () => {
  const [newCollections, setNewCollections] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/newcollection")
      .then((response) => response.json())
      .then((data) => setNewCollections(data))
      .catch((err) => console.error('Failed to fetch new collections', err));
  }, []);
  
  return (
    <div className = "new-collections">
        <h1>NEW COLLECTIONS</h1>
        <hr/>
        <div className= "collections">
           {newCollections.map((item, i) => {
            return <Item key={i} id={item.id} name={item.name} image={item.image} old_price={item.old_price} new_price={item.new_price}/>
             })}
                 
        </div>
    </div>
  )
}
export default NewCollections