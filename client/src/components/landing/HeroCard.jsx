import React from "react";

const HeroCard = ({ image, title, description, link }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default HeroCard;
