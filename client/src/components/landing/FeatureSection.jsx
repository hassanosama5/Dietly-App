import React from "react";

const FeatureSection = ({ title, children }) => {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
        {children}
      </div>
    </section>
  );
};

export default FeatureSection;
