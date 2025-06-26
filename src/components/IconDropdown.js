import React, { useState, useRef, useEffect } from 'react';

// This component is designed to be a drop-in replacement for the standard select
// It can be used with the same props as a standard select
const IconDropdown = (props) => {
  // Extract props that would be passed to a standard select
  const { id, value, onChange, className, style, showFooter = true } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Extract any children (option elements) and convert them to our format
  const extractOptionsFromChildren = () => {
    if (!props.children) return defaultIconOptions;
    
    // If props.children is an array, map through it
    if (Array.isArray(props.children)) {
      return props.children.map(child => {
        if (child.type === 'option') {
          return {
            value: child.props.value,
            label: child.props.children
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    return defaultIconOptions;
  };

  // Default icon options with labels
  const defaultIconOptions = [
    // General
    { value: 'fa-tag', label: 'Tag', keywords: ['label', 'category', 'mark'] },
    { value: 'fa-home', label: 'Home', keywords: ['house', 'apartment', 'residence', 'property', 'real estate', 'mortgage'] },
    { value: 'fa-utensils', label: 'Food', keywords: ['meal', 'restaurant', 'dining', 'lunch', 'dinner', 'breakfast', 'cuisine', 'grocery'] },
    { value: 'fa-car', label: 'Transport', keywords: ['vehicle', 'automobile', 'transportation', 'travel', 'commute'] },
    { value: 'fa-film', label: 'Entertainment', keywords: ['movie', 'cinema', 'theater', 'show', 'recreation', 'leisure', 'streaming', 'netflix', 'amazon', 'hulu'] },
    { value: 'fa-shopping-cart', label: 'Shopping', keywords: ['purchase', 'buy', 'store', 'mall', 'retail', 'market', 'supermarket', 'groceries'] },
    { value: 'fa-bolt', label: 'Utilities', keywords: ['electricity', 'power', 'energy', 'bill', 'service', 'utility'] },
    { value: 'fa-medkit', label: 'Healthcare', keywords: ['medical', 'doctor', 'hospital', 'health', 'medicine', 'pharmacy', 'clinic', 'insurance'] },
    { value: 'fa-graduation-cap', label: 'Education', keywords: ['school', 'college', 'university', 'course', 'degree', 'learning', 'tuition', 'student', 'class'] },
    { value: 'fa-money-bill-wave', label: 'Money', keywords: ['cash', 'currency', 'finance', 'dollar', 'euro', 'payment', 'income', 'salary'] },
    { value: 'fa-laptop', label: 'Technology', keywords: ['computer', 'electronics', 'device', 'gadget', 'software', 'hardware', 'digital'] },
    { value: 'fa-gift', label: 'Gift', keywords: ['present', 'donation', 'giveaway', 'birthday', 'holiday', 'christmas', 'celebration'] },
    { value: 'fa-chart-line', label: 'Investment', keywords: ['stock', 'market', 'finance', 'mutual fund', 'portfolio', 'dividend', 'return', 'profit', 'wealth'] },
    { value: 'fa-briefcase', label: 'Business', keywords: ['work', 'job', 'office', 'company', 'corporate', 'professional', 'career', 'employment'] },
    { value: 'fa-building', label: 'Building', keywords: ['office', 'apartment', 'structure', 'construction', 'property', 'commercial', 'real estate'] },
    { value: 'fa-plane', label: 'Travel', keywords: ['flight', 'vacation', 'trip', 'journey', 'tourism', 'holiday', 'airplane', 'airport', 'airline'] },
    
    // Personal
    { value: 'fa-tshirt', label: 'Clothing', keywords: ['clothes', 'apparel', 'fashion', 'wardrobe', 'outfit', 'garment', 'wear'] },
    { value: 'fa-baby', label: 'Children', keywords: ['kids', 'child', 'infant', 'toddler', 'baby', 'parenting', 'family', 'childcare', 'daycare'] },
    { value: 'fa-dog', label: 'Pets', keywords: ['animal', 'cat', 'dog', 'veterinary', 'pet food', 'pet care', 'pet supplies', 'vet'] },
    { value: 'fa-dumbbell', label: 'Fitness', keywords: ['gym', 'exercise', 'workout', 'health', 'training', 'sports', 'wellness', 'physical', 'strength'] },
    { value: 'fa-gamepad', label: 'Gaming', keywords: ['games', 'video games', 'console', 'playstation', 'xbox', 'nintendo', 'entertainment', 'esports'] },
    { value: 'fa-book', label: 'Books', keywords: ['reading', 'literature', 'education', 'library', 'novel', 'textbook', 'ebook', 'kindle', 'publication'] },
    { value: 'fa-coffee', label: 'Coffee', keywords: ['cafe', 'espresso', 'latte', 'cappuccino', 'starbucks', 'beverage', 'caffeine', 'tea'] },
    { value: 'fa-glass-martini', label: 'Drinks', keywords: ['alcohol', 'bar', 'cocktail', 'wine', 'beer', 'liquor', 'pub', 'nightlife', 'beverage'] },
    { value: 'fa-pizza-slice', label: 'Fast Food', keywords: ['takeout', 'delivery', 'burger', 'fries', 'pizza', 'junk food', 'quick meal', 'mcdonalds', 'restaurant'] },
    { value: 'fa-ice-cream', label: 'Dessert', keywords: ['sweet', 'cake', 'pastry', 'chocolate', 'candy', 'treat', 'bakery', 'ice cream', 'cookie'] },
    { value: 'fa-shopping-bag', label: 'Shopping Bag', keywords: ['purchase', 'retail', 'mall', 'store', 'shop', 'buying', 'consumer'] },
    { value: 'fa-glasses', label: 'Eyewear', keywords: ['spectacles', 'sunglasses', 'vision', 'optical', 'eye doctor', 'contacts', 'prescription'] },
    { value: 'fa-shoe-prints', label: 'Footwear', keywords: ['shoes', 'boots', 'sneakers', 'sandals', 'heels', 'footwear', 'nike', 'adidas'] },
    { value: 'fa-cut', label: 'Haircut', keywords: ['salon', 'barber', 'hairstyle', 'grooming', 'beauty', 'hair care', 'styling'] },
    { value: 'fa-spa', label: 'Spa', keywords: ['massage', 'wellness', 'relaxation', 'beauty', 'treatment', 'facial', 'therapy', 'self-care'] },
    
    // Relationships & Social
    { value: 'fa-heart', label: 'Dating', keywords: ['relationship', 'romance', 'love', 'partner', 'significant other', 'boyfriend', 'girlfriend', 'spouse', 'date night'] },
    { value: 'fa-ring', label: 'Marriage', keywords: ['wedding', 'spouse', 'husband', 'wife', 'anniversary', 'engagement', 'matrimony', 'ceremony', 'honeymoon'] },
    { value: 'fa-users', label: 'Friends', keywords: ['friendship', 'social', 'gathering', 'meetup', 'hangout', 'companions', 'buddies', 'pals', 'acquaintances'] },
    { value: 'fa-user-friends', label: 'Social', keywords: ['networking', 'socializing', 'community', 'group', 'meetup', 'social life', 'interaction', 'connection'] },
    { value: 'fa-glass-cheers', label: 'Party', keywords: ['celebration', 'event', 'gathering', 'festivity', 'nightlife', 'club', 'dance', 'entertainment', 'social'] },
    { value: 'fa-birthday-cake', label: 'Birthday', keywords: ['celebration', 'anniversary', 'party', 'gift', 'special day', 'cake', 'candles', 'age'] },
    { value: 'fa-gifts', label: 'Presents', keywords: ['gift', 'giving', 'present', 'package', 'surprise', 'holiday', 'christmas', 'birthday', 'wrapping'] },
    { value: 'fa-calendar-day', label: 'Event', keywords: ['occasion', 'meeting', 'appointment', 'gathering', 'conference', 'seminar', 'workshop', 'schedule'] },
    { value: 'fa-music', label: 'Concert', keywords: ['live music', 'performance', 'show', 'band', 'festival', 'gig', 'entertainment', 'ticket', 'venue'] },
    
    // Transportation
    { value: 'fa-bicycle', label: 'Bicycle', keywords: ['bike', 'cycling', 'ride', 'pedal', 'commute', 'exercise', 'transportation'] },
    { value: 'fa-motorcycle', label: 'Motorcycle', keywords: ['bike', 'motorbike', 'scooter', 'harley', 'yamaha', 'honda', 'kawasaki', 'vespa'] },
    { value: 'fa-car-alt', label: 'Car', keywords: ['auto', 'automobile', 'vehicle', 'sedan', 'suv', 'toyota', 'honda', 'ford', 'bmw', 'audi', 'mercedes'] },
    { value: 'fa-bus', label: 'Public Transport', keywords: ['transit', 'transportation', 'commute', 'metro', 'public', 'travel', 'city', 'urban'] },
    { value: 'fa-taxi', label: 'Taxi', keywords: ['cab', 'uber', 'lyft', 'ride', 'transportation', 'service', 'yellow cab', 'rideshare'] },
    { value: 'fa-train', label: 'Train', keywords: ['railway', 'rail', 'transit', 'amtrak', 'transportation', 'travel', 'commute', 'locomotive'] },
    { value: 'fa-subway', label: 'Subway', keywords: ['metro', 'underground', 'tube', 'transit', 'urban', 'city', 'transportation', 'commute'] },
    { value: 'fa-gas-pump', label: 'Fuel', keywords: ['gasoline', 'petrol', 'diesel', 'gas station', 'energy', 'car', 'fill up', 'petroleum'] },
    { value: 'fa-oil-can', label: 'Car Maintenance', keywords: ['repair', 'service', 'mechanic', 'garage', 'auto shop', 'oil change', 'tune up', 'vehicle'] },
    { value: 'fa-parking', label: 'Parking', keywords: ['garage', 'lot', 'space', 'car park', 'valet', 'meter', 'fee', 'permit'] },
    
    // Sports & Recreation
    { value: 'fa-futbol', label: 'Soccer', keywords: ['football', 'sport', 'game', 'team', 'league', 'fifa', 'match', 'field', 'ball'] },
    { value: 'fa-basketball-ball', label: 'Basketball', keywords: ['sport', 'nba', 'game', 'team', 'court', 'ball', 'hoop', 'league'] },
    { value: 'fa-baseball-ball', label: 'Baseball', keywords: ['sport', 'mlb', 'game', 'team', 'bat', 'ball', 'field', 'league'] },
    { value: 'fa-volleyball-ball', label: 'Volleyball', keywords: ['sport', 'game', 'team', 'beach', 'net', 'ball', 'court'] },
    { value: 'fa-golf-ball', label: 'Golf', keywords: ['sport', 'club', 'course', 'pga', 'driving range', 'putt', 'green', 'tee'] },
    { value: 'fa-table-tennis', label: 'Table Tennis', keywords: ['ping pong', 'sport', 'game', 'paddle', 'ball', 'tournament'] },
    { value: 'fa-skiing', label: 'Skiing', keywords: ['winter', 'snow', 'sport', 'mountain', 'resort', 'slopes', 'downhill', 'cross-country'] },
    { value: 'fa-swimmer', label: 'Swimming', keywords: ['pool', 'water', 'sport', 'exercise', 'aquatic', 'beach', 'ocean', 'lake'] },
    { value: 'fa-running', label: 'Running', keywords: ['jog', 'marathon', 'exercise', 'fitness', 'race', 'track', 'cardio', 'sprint'] },
    { value: 'fa-hiking', label: 'Hiking', keywords: ['trek', 'trail', 'mountain', 'outdoors', 'nature', 'walk', 'backpacking', 'adventure'] },
    { value: 'fa-biking', label: 'Biking', keywords: ['cycling', 'bicycle', 'mountain bike', 'ride', 'trail', 'exercise', 'sport', 'outdoor'] },
    { value: 'fa-campground', label: 'Camping', keywords: ['tent', 'outdoors', 'nature', 'hiking', 'wilderness', 'backpacking', 'adventure', 'forest'] },
    
    // Home & Bills
    { value: 'fa-couch', label: 'Furniture' },
    { value: 'fa-tv', label: 'Electronics' },
    { value: 'fa-wifi', label: 'Internet' },
    { value: 'fa-phone', label: 'Phone' },
    { value: 'fa-tint', label: 'Water' },
    { value: 'fa-fire', label: 'Heating' },
    { value: 'fa-fan', label: 'Air Conditioning' },
    { value: 'fa-lightbulb', label: 'Electricity' },
    { value: 'fa-broom', label: 'Cleaning' },
    { value: 'fa-tools', label: 'Repairs' },
    { value: 'fa-hammer', label: 'Renovation' },
    { value: 'fa-paint-roller', label: 'Painting' },
    { value: 'fa-bed', label: 'Bedroom' },
    { value: 'fa-bath', label: 'Bathroom' },
    { value: 'fa-kitchen-set', label: 'Kitchen' },
    { value: 'fa-chair', label: 'Furniture' },
    { value: 'fa-trash', label: 'Waste' },
    { value: 'fa-snowflake', label: 'Cooling' },
    { value: 'fa-key', label: 'Rent' },
    
    // Financial
    { value: 'fa-credit-card', label: 'Credit Card' },
    { value: 'fa-piggy-bank', label: 'Savings' },
    { value: 'fa-hand-holding-usd', label: 'Donations' },
    { value: 'fa-file-invoice-dollar', label: 'Bills' },
    { value: 'fa-coins', label: 'Coins' },
    { value: 'fa-university', label: 'Banking' },
    { value: 'fa-percentage', label: 'Interest' },
    { value: 'fa-donate', label: 'Charity' },
    
    // Work & Income
    { value: 'fa-store', label: 'Store' },
    { value: 'fa-concierge-bell', label: 'Service' },
    { value: 'fa-handshake', label: 'Deal' },
    { value: 'fa-hands-helping', label: 'Support' },
    { value: 'fa-award', label: 'Bonus' },
    
    // Other
    { value: 'fa-ellipsis-h', label: 'Other' },
    { value: 'fa-question-circle', label: 'Unknown' },
    { value: 'fa-exclamation-circle', label: 'Important' }
  ];

  // Use options from props.children if available, otherwise use default options
  const iconOptions = extractOptionsFromChildren();
  
  // Filter options based on search term
  const filteredOptions = iconOptions.filter(option => {
    const searchTermLower = searchTerm.toLowerCase();
    // Search in label
    if (option.label.toLowerCase().includes(searchTermLower)) {
      return true;
    }
    // Search in keywords if available
    if (option.keywords && Array.isArray(option.keywords)) {
      return option.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTermLower)
      );
    }
    return false;
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // We intentionally don't auto-focus the search input when dropdown opens
  // This prevents mobile keyboard from automatically appearing

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  // Handle selecting an option
  const handleSelect = (option) => {
    // Create a synthetic event to mimic the standard select onChange behavior
    const syntheticEvent = {
      target: {
        value: option.value
      }
    };
    
    // Call onChange with the synthetic event to match standard select behavior
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Find the selected option
  const selectedOption = iconOptions.find(option => option.value === value) || iconOptions[0];
  
  // Extract required from props
  const required = props.required || false;

  return (
    <div className="custom-dropdown-container icon-dropdown" ref={dropdownRef} style={style}>
      <div 
        className={`custom-dropdown-selected ${className || ''}`}
        onClick={toggleDropdown}
      >
        <i className={`fas ${value} selected-icon`}></i>
        <span className="selected-icon-label">{selectedOption.label}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>
      
      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="custom-dropdown-search">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="custom-dropdown-options icon-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={`custom-dropdown-option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  <i className={`fas ${option.value}`}></i>
                  <span>{option.label}</span>
                </div>
              ))
            ) : (
              <div className="custom-dropdown-no-results">No icons found</div>
            )}
          </div>
          {showFooter && (
            <div 
              className="custom-dropdown-footer" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                window.location.href = '#/settings';
              }}
            >
              Go to <span className="settings-link">settings</span> to customize
            </div>
          )}
        </div>
      )}
      
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          id={id}
          value={value}
          required
          style={{ display: 'none' }}
          onChange={() => {}}
        />
      )}
    </div>
  );
};

export default IconDropdown;
