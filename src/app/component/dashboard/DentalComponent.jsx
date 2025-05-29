import React from 'react';
import { useContext } from 'react';
import { DataContext } from './dashboard';


const DentalComponent = () => {
    const {selectedTooth,setSelectedTooth,} = useContext(DataContext);
    console.log(selectedTooth)
    return (
        <div>
            {selectedTooth} 
        </div>
    );
}

export default DentalComponent;
