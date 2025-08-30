import React from 'react';
import { useContext } from 'react';
import { DataContext } from './dashboard';


const DentalComponent = () => {
    const {selectedTooth,setSelectedTooth,} = useContext(DataContext);
        return (
        <div>
            {selectedTooth} 
        </div>
    );
}

export default DentalComponent;
