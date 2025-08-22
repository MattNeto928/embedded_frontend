import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ECE 4180</h3>
            <p className="text-secondary-300">
              Embedded Systems Design with ESP32-C6
            </p>
            <p className="text-secondary-300 mt-2">
              &copy; {new Date().getFullYear()} Georgia Institute of Technology
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.espressif.com/en/products/socs/esp32-c6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-300 hover:text-white"
                >
                  ESP32-C6 Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/index.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-300 hover:text-white"
                >
                  ESP-IDF Programming Guide
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/espressif/esp-idf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-300 hover:text-white"
                >
                  ESP-IDF GitHub Repository
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-secondary-300">
              For technical support or questions about the labs, please contact your instructor or TA.
            </p>
            <p className="text-secondary-300 mt-2">
              Office Hours: Monday-Friday, 10:00 AM - 4:00 PM
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
