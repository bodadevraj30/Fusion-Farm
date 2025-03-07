CREATE DATABASE IF NOT EXISTS Fusionfarm;

USE FusionFarm;

CREATE TABLE IF NOT EXISTS farmers (
    phone_number VARCHAR(10) PRIMARY KEY CHECK (LENGTH(phone_number) = 10),
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS ard (
    phone_number VARCHAR(10) PRIMARY KEY CHECK (LENGTH(phone_number) = 10),
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS amd (
    phone_number VARCHAR(10) PRIMARY KEY CHECK (LENGTH(phone_number) = 10),
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    phone_number VARCHAR(10) PRIMARY KEY CHECK (LENGTH(phone_number) = 10),
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS phone (
    phone_number VARCHAR(10) PRIMARY KEY
);

DELIMITER //

CREATE TRIGGER insert_phone_number_1
AFTER INSERT ON farmers
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM phone WHERE phone_number = NEW.phone_number) THEN
        INSERT INTO phone (phone_number) VALUES (NEW.phone_number);
    END IF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER insert_phone_number_2
AFTER INSERT ON ard
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM phone WHERE phone_number = NEW.phone_number) THEN
        INSERT INTO phone (phone_number) VALUES (NEW.phone_number);
    END IF;
END;
//

DELIMITER ;



DELIMITER //

CREATE TRIGGER insert_phone_number_3
AFTER INSERT ON amd
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM phone WHERE phone_number = NEW.phone_number) THEN
        INSERT INTO phone (phone_number) VALUES (NEW.phone_number);
    END IF;
END;
//

DELIMITER ;



DELIMITER //

CREATE TRIGGER insert_phone_number_4
AFTER INSERT ON customer
FOR EACH ROW
BEGIN
    IF NOT EXISTS (SELECT 1 FROM phone WHERE phone_number = NEW.phone_number) THEN
        INSERT INTO phone (phone_number) VALUES (NEW.phone_number);
    END IF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER delete_phone_number_1
AFTER DELETE ON farmers
FOR EACH ROW
BEGIN
    DECLARE phone_count INT;
    SET phone_count = 0;

    -- Check if the phone number exists in any other table
    SELECT COUNT(*) INTO phone_count FROM ard WHERE phone_number = OLD.phone_number;
    IF phone_count = 0 THEN
        SELECT COUNT(*) INTO phone_count FROM amd WHERE phone_number = OLD.phone_number;
        IF phone_count = 0 THEN
            SELECT COUNT(*) INTO phone_count FROM customer WHERE phone_number = OLD.phone_number;
            IF phone_count = 0 THEN
                -- phone number doesn't exist in any table, delete from phone table
                DELETE FROM phone WHERE phone_number = OLD.phone_number;
            END IF;
        END IF;
    END IF;
END;
//

DELIMITER ;

DELIMITER //

CREATE TRIGGER delete_phone_number_2
AFTER DELETE ON ard
FOR EACH ROW
BEGIN
    DECLARE phone_count INT;
    SET phone_count = 0;

    -- Check if the phone number exists in any other table
    SELECT COUNT(*) INTO phone_count FROM farmers WHERE phone_number = OLD.phone_number;
    IF phone_count = 0 THEN
        SELECT COUNT(*) INTO phone_count FROM amd WHERE phone_number = OLD.phone_number;
        IF phone_count = 0 THEN
            SELECT COUNT(*) INTO phone_count FROM customer WHERE phone_number = OLD.phone_number;
            IF phone_count = 0 THEN
                -- phone number doesn't exist in any table, delete from phone table
                DELETE FROM phone WHERE phone_number = OLD.phone_number;
            END IF;
        END IF;
    END IF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER delete_phone_number_3
AFTER DELETE ON amd
FOR EACH ROW
BEGIN
    DECLARE phone_count INT;
    SET phone_count = 0;

    -- Check if the phone number exists in any other table
    SELECT COUNT(*) INTO phone_count FROM ard WHERE phone_number = OLD.phone_number;
    IF phone_count = 0 THEN
        SELECT COUNT(*) INTO phone_count FROM farmers WHERE phone_number = OLD.phone_number;
        IF phone_count = 0 THEN
            SELECT COUNT(*) INTO phone_count FROM customer WHERE phone_number = OLD.phone_number;
            IF phone_count = 0 THEN
                -- phone number doesn't exist in any table, delete from phone table
                DELETE FROM phone WHERE phone_number = OLD.phone_number;
            END IF;
        END IF;
    END IF;
END;
//

DELIMITER ;


DELIMITER //

CREATE TRIGGER delete_phone_number_4
AFTER DELETE ON customer
FOR EACH ROW
BEGIN
    DECLARE phone_count INT;
    SET phone_count = 0;

    -- Check if the phone number exists in any other table
    SELECT COUNT(*) INTO phone_count FROM ard WHERE phone_number = OLD.phone_number;
    IF phone_count = 0 THEN
        SELECT COUNT(*) INTO phone_count FROM amd WHERE phone_number = OLD.phone_number;
        IF phone_count = 0 THEN
            SELECT COUNT(*) INTO phone_count FROM farmers WHERE phone_number = OLD.phone_number;
            IF phone_count = 0 THEN
                -- phone number doesn't exist in any table, delete from phone table
                DELETE FROM phone WHERE phone_number = OLD.phone_number;
            END IF;
        END IF;
    END IF;
END;
//

DELIMITER ;

CREATE TABLE IF NOT EXISTS address (
    phone_number VARCHAR(10) PRIMARY KEY, 
    State VARCHAR(255) NOT NULL,
    District VARCHAR(255) NOT NULL, 
    Mandal VARCHAR(255) NOT NULL, 
    village_city VARCHAR(255) NOT NULL, 
    H_No VARCHAR(30) NOT NULL, 
    Pincode VARCHAR(6) NOT NULL, 
    Landmark VARCHAR(255),
    FOREIGN KEY (phone_number) REFERENCES phone(phone_number) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS crop (
    phone_number VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (phone_number, name),
    FOREIGN KEY (phone_number) REFERENCES farmers(phone_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seeds (
    phone_number VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    bags DECIMAL(10, 2),
    PRIMARY KEY (phone_number, name, weight),
    FOREIGN KEY (phone_number) REFERENCES ard(phone_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fertilizers (
    phone_number VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    bags DECIMAL(10, 2),
    PRIMARY KEY (phone_number, name),
    FOREIGN KEY (phone_number) REFERENCES ard(phone_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pesticides (
    phone_number VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    bags DECIMAL(10, 2),
    PRIMARY KEY (phone_number, name),
    FOREIGN KEY (phone_number) REFERENCES ard(phone_number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS machinery (
    phone_number VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rentSale ENUM('Rent', 'Sale') NOT NULL,
    PRIMARY KEY (phone_number, name),
    FOREIGN KEY (phone_number) REFERENCES amd(phone_number) ON DELETE CASCADE
);

INSERT INTO farmers (phone_number, name, password)
VALUES 
    ('8125314244', 'Devraj', 'pass123'),
    ('9876543210', 'John Doe', 'password123'),
    ('8765432109', 'Jane Smith', 'securepass'),
    ('7654321098', 'Alice Johnson', 'strongpass'),
    ('6543210987', 'Bob Williams', 'pass1234'),
    ('5432109876', 'Emma Davis', 'securepassword'),
    ('4321098765', 'Michael Brown', 'mypass123'),
    ('3210987654', 'Sophia Wilson', 'password456'),
    ('2109876543', 'David Taylor', 'strongpassword'),
    ('1098765432', 'Olivia Moore', 'mypassword789'),
    ('9988776655', 'Alex Turner', 'password987');


INSERT INTO ard (phone_number, name, password)
VALUES 
    ('8125314244', 'Devraj', 'pass123'),
    ('9876543222', 'Alice Robertson', 'ardpass123'),
    ('8765432333', 'Benjamin Harris', 'secureardpass'),
    ('7654323444', 'Catherine Miller', 'ardstrongpass'),
    ('6543214555', 'Daniel Turner', 'ardpass456'),
    ('5432105666', 'Eva Wilson', 'ardsecurepassword'),
    ('4321096777', 'Franklin Smith', 'ardmypass123'),
    ('3210987888', 'Grace Davis', 'ardpass789'),
    ('2109878999', 'Henry Brown', 'ardstrongpassword'),
    ('1098760000', 'Isabella Taylor', 'ardmypassword789'),
    ('9988771111', 'James Turner', 'ardpassword987');


INSERT INTO amd (phone_number, name, password)
VALUES 
    ('9876543444', 'Aaron Mitchell', 'amdpass123'),
    ('8765433555', 'Bella Anderson', 'secureamdpass'),
    ('7654323666', 'Caleb White', 'amdstrongpass'),
    ('6543213777', 'Daisy Thomas', 'amdpass456'),
    ('5432103888', 'Elijah Martin', 'amdsecurepassword'),
    ('4321093999', 'Fiona Walker', 'amdmypass123'),
    ('3210984000', 'Gavin Miller', 'amdpass789'),
    ('2109874111', 'Hannah Bennett', 'amdstrongpassword'),
    ('1098764222', 'Isaac Turner', 'amdmypassword789'),
    ('9988774333', 'Jasmine Cooper', 'amdpassword987');


INSERT INTO customer (phone_number, name, password)
VALUES 
    ('9876544777', 'Liam Johnson', 'customerpass123'),
    ('8765434888', 'Olivia Smith', 'securecustomerpass'),
    ('7654325999', 'Noah Davis', 'customerstrongpass'),
    ('6543216000', 'Emma Taylor', 'customerpass456'),
    ('5432107111', 'Aiden Brown', 'customersecurepassword'),
    ('4321098222', 'Sophia Wilson', 'customermypass123'),
    ('3210989333', 'Jackson Harris', 'customerpass789'),
    ('2109870444', 'Mia Turner', 'customerstrongpassword'),
    ('1098761555', 'Lucas Anderson', 'customermypassword789'),
    ('9988772666', 'Ava Mitchell', 'customerpassword987');


-- Insert sample address data into the address table for different entities in India
INSERT INTO address (phone_number, State, District, Mandal, village_city, H_No, Pincode, Landmark)
VALUES 
('9876543210', 'Karnataka', 'Bangalore', 'East', 'Whitefield', 'H_No1', '560001', 'Landmark1'),
('8765432109', 'Maharashtra', 'Mumbai', 'South', 'Colaba', 'H_No2', '400001', 'Landmark2'),
('7654321098', 'Tamil Nadu', 'Chennai', 'West', 'Adyar', 'H_No3', '600001', 'Landmark3'),
('6543210987', 'Uttar Pradesh', 'Lucknow', 'North', 'Hazratganj', 'H_No4', '226001', 'Landmark4'),
('5432109876', 'West Bengal', 'Kolkata', 'Central', 'Park Street', 'H_No5', '700001', 'Landmark5'),
('4321098765', 'Punjab', 'Amritsar', 'South', 'Golden Temple', 'H_No6', '143001', 'Landmark6'),
('3210987654', 'Rajasthan', 'Jaipur', 'West', 'Hawa Mahal', 'H_No7', '302001', 'Landmark7'),
('2109876543', 'Gujarat', 'Ahmedabad', 'North', 'Sabarmati Ashram', 'H_No8', '380005', 'Landmark8'),
('1098765432', 'Bihar', 'Patna', 'East', 'Gandhi Maidan', 'H_No9', '800001', 'Landmark9'),
('9988776655', 'Madhya Pradesh', 'Bhopal', 'East', 'Arera Colony', 'H_No10', '462011', 'Landmark10'),
('9876543222', 'Himachal Pradesh', 'Shimla', 'North', 'The Ridge', 'H_No11', '171001', 'Landmark11'),
('8765432333', 'Assam', 'Guwahati', 'South', 'Kamakhya Temple', 'H_No12', '781001', 'Landmark12'),
('7654323444', 'Odisha', 'Bhubaneswar', 'West', 'Nandan Kanan', 'H_No13', '751024', 'Landmark13'),
('6543214555', 'Telangana', 'Hyderabad', 'Central', 'Charminar', 'H_No14', '500002', 'Landmark14'),
('5432105666', 'Jammu and Kashmir', 'Srinagar', 'East', 'Dal Lake', 'H_No15', '190001', 'Landmark15'),
('4321096777', 'Arunachal Pradesh', 'Itanagar', 'West', 'Ganga Lake', 'H_No16', '791111', 'Landmark16'),
('3210987888', 'Chhattisgarh', 'Raipur', 'South', 'Mahant Ghasidas Memorial Museum', 'H_No17', '492001', 'Landmark17'),
('2109878999', 'Kerala', 'Thiruvananthapuram', 'North', 'Napier Museum', 'H_No18', '695014', 'Landmark18'),
('1098760000', 'Uttarakhand', 'Dehradun', 'Central', 'Robbers Cave', 'H_No19', '248001', 'Landmark19'),
('9988771111', 'Tamil Nadu', 'Chennai', 'East', 'Marina Beach', 'H_No20', '600006', 'Landmark20'),
('9876543444', 'Jharkhand', 'Ranchi', 'Central', 'Dhurwa', 'H_No21', '834004', 'Landmark21'),
('8765433555', 'Puducherry', 'Puducherry', 'South', 'Rock Beach', 'H_No22', '605001', 'Landmark22'),
('7654323666', 'Meghalaya', 'Shillong', 'East', 'Elephant Falls', 'H_No23', '793001', 'Landmark23'),
('6543213777', 'Nagaland', 'Kohima', 'West', 'Kohima War Cemetery', 'H_No24', '797001', 'Landmark24'),
('5432103888', 'Tripura', 'Agartala', 'North', 'Ujjayanta Palace', 'H_No25', '799001', 'Landmark25'),
('4321093999', 'Sikkim', 'Gangtok', 'South', 'Nathula Pass', 'H_No26', '737101', 'Landmark26'),
('3210984000', 'Manipur', 'Imphal', 'Central', 'Kangla Fort', 'H_No27', '795001', 'Landmark27'),
('2109874111', 'Mizoram', 'Aizawl', 'East', 'Durtlang Hills', 'H_No28', '796001', 'Landmark28'),
('1098764222', 'Andhra Pradesh', 'Vijayawada', 'West', 'Prakasam Barrage', 'H_No29', '520001', 'Landmark29'),
('9988774333', 'Karnataka', 'Mangalore', 'South', 'Panambur Beach', 'H_No30', '575010', 'Landmark30'),
('9876544777', 'Maharashtra', 'Pune', 'East', 'Shaniwar Wada', 'H_No31', '411030', 'Landmark31'),
('8765434888', 'Gujarat', 'Surat', 'South', 'Dumas Beach', 'H_No32', '395007', 'Landmark32'),
('7654325999', 'Rajasthan', 'Jodhpur', 'West', 'Mehrangarh Fort', 'H_No33', '342001', 'Landmark33'),
('6543216000', 'Delhi', 'New Delhi', 'North', 'India Gate', 'H_No34', '110001', 'Landmark34'),
('5432107111', 'Haryana', 'Chandigarh', 'Central', 'Rock Garden', 'H_No35', '160101', 'Landmark35'),
('4321098222', 'Uttar Pradesh', 'Agra', 'South', 'Taj Mahal', 'H_No36', '282001', 'Landmark36'),
('3210989333', 'West Bengal', 'Howrah', 'East', 'Howrah Bridge', 'H_No37', '711101', 'Landmark37'),
('2109870444', 'Tamil Nadu', 'Coimbatore', 'North', 'Marudhamalai Murugan Temple', 'H_No38', '641046', 'Landmark38'),
('1098761555', 'Karnataka', 'Bangalore', 'West', 'Lalbagh Botanical Garden', 'H_No39', '560004', 'Landmark39'),
('9988772666', 'Tamil Nadu', 'Madurai', 'South', 'Meenakshi Amman Temple', 'H_No40', '625001', 'Landmark40');


-- Insert sample crop data into the crop table for farmers in India
INSERT INTO crop (phone_number, name, quantity, price)
VALUES 
    ('9876543210', 'Rice', 100.50, 5000.00),
    ('8765432109', 'Wheat', 75.25, 4500.00),
    ('7654321098', 'Maize', 120.75, 6000.00),
    ('6543210987', 'Pulses', 50.00, 3000.00),
    ('5432109876', 'Cotton', 80.20, 7000.00),
    ('4321098765', 'Sugarcane', 200.00, 8000.00),
    ('3210987654', 'Mustard', 40.50, 3500.00),
    ('2109876543', 'Soybean', 90.80, 5500.00),
    ('1098765432', 'Coffee', 30.25, 9000.00),
    ('9988776655', 'Tea', 25.50, 8500.00),
    ('9876543210', 'Spices', 15.75, 4000.00),
    ('8765432109', 'Fruits', 70.00, 7500.00),
    ('7654321098', 'Vegetables', 60.30, 6500.00),
    ('6543210987', 'Oilseeds', 45.90, 5000.00),
    ('5432109876', 'Flowers', 10.25, 4500.00),
    ('4321098765', 'Herbs', 5.75, 3000.00),
    ('3210987654', 'Paddy', 110.00, 5500.00),
    ('2109876543', 'Barley', 35.50, 4000.00),
    ('1098765432', 'Jute', 85.80, 7000.00),
    ('9988776655', 'Millet', 25.25, 3500.00);



-- Insert sample seed data into the seeds table for ard in India
INSERT INTO seeds (phone_number, name, company, price, weight, bags)
VALUES 
    ('9876543222', 'Wheat Seeds', 'IndianAgro', 300.00, 50.00, 10.00),
    ('8765432333', 'Rice Seeds', 'HarvestIndia', 250.00, 40.00, 8.00),
    ('7654323444', 'Maize Seeds', 'farmersChoice', 180.00, 30.00, 6.00),
    ('6543214555', 'Barley Seeds', 'AgriGold', 320.00, 55.00, 12.00),
    ('5432105666', 'Soybean Seeds', 'GreenHarvest', 200.00, 35.00, 7.00),
    ('4321096777', 'Paddy Seeds', 'GoldenFields', 280.00, 48.00, 9.50),
    ('3210987888', 'Cotton Seeds', 'CottonAgro', 350.00, 60.00, 15.00),
    ('2109878999', 'Jute Seeds', 'JuteIndustries', 150.00, 25.00, 5.00),
    ('1098760000', 'Sunflower Seeds', 'SunshineAgro', 400.00, 70.00, 18.00),
    ('9988771111', 'Mustard Seeds', 'SpiceHarvest', 220.00, 38.00, 8.50);


-- Insert sample fertilizer data into the fertilizers table for ard in India
INSERT INTO fertilizers (phone_number, name, description, company, price, weight, bags)
VALUES 
    ('9876543222', 'Nitrogen-Rich Blend', 'Highly effective for crop growth', 'GreenHarvest', 150.00, 25.00, 5.00),
    ('8765432333', 'Phosphorus-Based Mix', 'HarvestIndia', 'AgriGold', 120.00, 20.00, 4.00),
    ('7654323444', 'Potassium-Enriched Formula', 'farmersChoice', 'OrganicFarms', 180.00, 30.00, 6.00),
    ('6543214555', 'Complete NPK Fertilizer', 'GoldenFields', 'BioHarvest', 200.00, 35.00, 7.00),
    ('5432105666', 'Organic Compost', 'CottonAgro', 'EcoGrow', 100.00, 15.00, 3.00),
    ('4321096777', 'Microbial Inoculants', 'SpiceHarvest', 'MicroOrganix', 80.00, 12.00, 2.50),
    ('3210987888', 'Calcium-Rich Supplement', 'JuteIndustries', 'CalciumHarvest', 160.00, 28.00, 5.50),
    ('2109878999', 'Magnesium-Infused Mix', 'SunshineAgro', 'MagnaGrow', 140.00, 24.00, 5.00),
    ('1098760000', 'Sulfur-Containing Blend', 'SesameFarms', 'SulfurHarvest', 110.00, 18.00, 3.50),
    ('9988771111', 'Iron-Enhanced Formula', 'HempHarvest', 'IronAgro', 130.00, 22.00, 4.50),
    ('9876543222', 'Zinc-Based Fertilizer', 'FenugreekFarms', 'ZincHarvest', 90.00, 14.00, 3.00),
    ('8765432333', 'Boron-Enriched Mix', 'QuinoaHarvest', 'BoronAgro', 170.00, 30.00, 6.50),
    ('7654323444', 'Manganese-Infused Blend', 'SafflowerIndustries', 'ManganeseHarvest', 150.00, 26.00, 5.50),
    ('6543214555', 'Copper-Rich Supplement', 'HempHarvest', 'CopperAgro', 120.00, 20.00, 4.00),
    ('5432105666', 'Silicon-Based Fertilizer', 'FenugreekFarms', 'SiliconHarvest', 130.00, 22.00, 4.50);


-- Insert sample pesticide data into the pesticides table for ard in India
INSERT INTO pesticides (phone_number, name, description, company, price, weight, bags)
VALUES 
    ('9876543222', 'Insecticide-A', 'Effective against common pests', 'GreenHarvest', 200.00, 15.00, 3.00),
    ('8765432333', 'Fungicide-B', 'Controls fungal diseases', 'HarvestIndia', 180.00, 12.00, 2.50),
    ('7654323444', 'Herbicide-C', 'Targets unwanted weeds', 'farmersChoice', 160.00, 10.00, 2.00),
    ('6543214555', 'Rodenticide-D', 'Eliminates rodents and pests', 'GoldenFields', 220.00, 18.00, 3.50),
    ('5432105666', 'Nematicide-E', 'Protects against nematodes', 'OrganicFarms', 240.00, 20.00, 4.00),
    ('4321096777', 'Bactericide-F', 'Controls bacterial infections', 'CottonAgro', 200.00, 15.00, 3.00),
    ('3210987888', 'Virucide-G', 'Targets viral pathogens', 'JuteIndustries', 260.00, 22.00, 4.50),
    ('2109878999', 'Molluscicide-H', 'Effective against mollusks', 'SunshineAgro', 180.00, 12.00, 2.50),
    ('1098760000', 'Miticide-I', 'Controls mites and ticks', 'SesameFarms', 220.00, 18.00, 3.50),
    ('9988771111', 'Repellent-J', 'Repels common pests', 'HempHarvest', 160.00, 10.00, 2.00),
    ('9988771111', 'Attractant-K', 'Attracts beneficial insects', 'FenugreekFarms', 200.00, 15.00, 3.00),
    ('1098760000', 'Antifeedant-L', 'Prevents feeding damage', 'QuinoaHarvest', 180.00, 12.00, 2.50),
    ('2109878999', 'Biological Control-M', 'Uses natural enemies', 'SafflowerIndustries', 240.00, 20.00, 4.00),
    ('3210987888', 'Rescue Chemical-N', 'Emergency pest control', 'HempHarvest', 200.00, 15.00, 3.00),
    ('4321096777', 'Plant Growth Regulator-O', 'Controls plant growth', 'LinseedIndustries', 260.00, 22.00, 4.50);


-- Insert sample machinery data into the machinery table for amd in India
INSERT INTO machinery (phone_number, name, description, company, price, rentSale)
VALUES 
    ('9876543444', 'Tractor-A', 'Powerful agricultural tractor', 'IndianAgroTech', 500000.00, 'Rent'),
    ('8765433555', 'Combine Harvester-B', 'Efficient harvesting machine', 'HarvestIndia', 800000.00, 'Sale'),
    ('7654323666', 'Plough-C', 'Turns and breaks soil', 'FarmMech', 20000.00, 'Sale'),
    ('6543213777', 'Seeder-D', 'Planting seeds efficiently', 'SowMaster', 30000.00, 'Rent'),
    ('5432103888', 'Sprayer-E', 'Applies pesticides and fertilizers', 'AgriSpray', 40000.00, 'Sale'),
    ('4321093999', 'Cultivator-F', 'Prepares soil for planting', 'SoilMaster', 25000.00, 'Sale'),
    ('3210984000', 'Thresher-G', 'Separates grains from harvested crop', 'GrainTech', 60000.00, 'Sale'),
    ('2109874111', 'Rotavator-H', 'Cuts, mixes, and levels soil', 'EarthTill', 35000.00, 'Rent'),
    ('1098764222', 'Harrow-I', 'Breaks up soil after ploughing', 'AgroBreak', 18000.00, 'Sale'),
    ('9988774333', 'Tiller-J', 'Cultivates and tills soil', 'TillMaster', 22000.00, 'Sale'),
    ('9876543444', 'Seeder-Planter-K', 'Planting seeds in rows', 'RowSeeder', 32000.00, 'Sale'),
    ('8765433555', 'Transplanter-L', 'Transplants seedlings', 'SeedTrans', 28000.00, 'Sale'),
    ('7654323666', 'Sickle-Bar Mower-M', 'Mows and harvests forage crops', 'CropHarvest', 28000.00, 'Sale'),
    ('6543213777', 'Baler-N', 'Bales and bundles crops', 'CropBale', 45000.00, 'Rent'),
    ('8765433555', 'Seeder Spreader-O', 'Spreads seeds and fertilizers', 'AgroSpread', 30000.00, 'Sale');




CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    buyer_phone_number VARCHAR(10) NOT NULL,
    seller_phone_number VARCHAR(10) NOT NULL,
    item VARCHAR(255) NOT NULL,
    order_date DATE NOT NULL,
    rentSale ENUM('Rent', 'Sale') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered') NOT NULL
);


-- Insert sample data into the orders table with references to Indian customers and sellers
INSERT INTO orders (buyer_phone_number, seller_phone_number, item, order_date, rentSale, price, status)
VALUES 
    ('5432109876', '4321096777', 'Paddy Seeds', '2024-02-10', 'Sale', 280.00, 'Pending'),
    ('4321098765', '3210987888', 'Calcium-Rich Supplement', '2024-02-12', 'Sale', 160.00, 'Processing'),
    ('8765432109', '6543214555', 'Rodenticide-D', '2024-02-15', 'Sale', 220.00, 'Shipped'),
    ('7654321098', '2109874111', 'Rotavator-H', '2024-02-18', 'Rent', 35000.00, 'Pending'),
    ('7654325999', '5432109876', 'Cotton', '2024-02-20', 'Sale', 7000.00, 'Processing'),
    ('6543216000', '4321098765', 'Sugarcane', '2024-02-23', 'Sale', 8000.00, 'Shipped'),
    ('5432107111', '3210987654', 'Mustard', '2024-02-26', 'Sale', 3500.50, 'Delivered'),
    ('4321098222', '2109876543', 'Soybean', '2024-02-28', 'Sale', 5500.00, 'Pending'),
    ('3210989333', '1098765432', 'Coffee', '2024-03-02', 'Sale', 9000.00, 'Processing'),
    ('6543216000', '9876543210', 'Spices', '2024-03-05', 'Sale', 4000.00, 'Shipped'),
    ('4321098222', '8765432109', 'Fruits', '2024-03-08', 'Sale', 7500.00, 'Pending');


CREATE TABLE cart (
    buyer_phone_no VARCHAR(15),
    seller_phone_no VARCHAR(15),
    item_name VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    time TIME,
    date DATE,
    PRIMARY KEY (time, date)
);


INSERT INTO cart (buyer_phone_no, seller_phone_no, item_name, price, time, date)
VALUES 
('6543216000', '9876543210', 'Rice', 5000.00, '10:00:00', '2024-04-08'),
('4321098222', '7654321098', 'Maize', 6000.00, '11:30:00', '2024-04-08'),
('8125314244', '9876543222', 'Wheat Seeds', 300.00, '13:15:00', '2024-04-08'),
('8125314244', '8765432333', 'Nitrogen-Rich Blend', 150.00, '15:45:00', '2024-04-08');


ALTER TABLE crop ADD COLUMN image_path VARCHAR(255) DEFAULT '/images/default.png';
ALTER TABLE seeds ADD COLUMN image_path VARCHAR(255) DEFAULT '/images/default.png';
ALTER TABLE fertilizers ADD COLUMN image_path VARCHAR(255) DEFAULT '/images/default.png';
ALTER TABLE pesticides ADD COLUMN image_path VARCHAR(255) DEFAULT '/images/default.png';
ALTER TABLE machinery ADD COLUMN image_path VARCHAR(255) DEFAULT '/images/default.png';


UPDATE crop SET image_path = '/images/crop_rice.jpg' WHERE name = 'Rice';
UPDATE crop SET image_path = '/images/crop_wheat.jpg' WHERE name = 'Wheat';
UPDATE crop SET image_path = '/images/crop_maize.jpg' WHERE name = 'Maize';
UPDATE crop SET image_path = '/images/crop_pulses.jpg' WHERE name = 'Pulses';
UPDATE crop SET image_path = '/images/crop_cotton.png' WHERE name = 'Cotton';

UPDATE seeds SET image_path = '/images/seeds_wheat.jpg' WHERE name = 'Wheat Seeds';
UPDATE seeds SET image_path = '/images/seeds_rice.jpg' WHERE name = 'Rice Seeds';
UPDATE seeds SET image_path = '/images/seeds_maize.jpg' WHERE name = 'Maize Seeds';

UPDATE fertilizers SET image_path = '/images/fertilizer_npk.jpg' WHERE name = 'Complete NPK Fertilizer';
UPDATE fertilizers SET image_path = '/images/fertilizer_organic.jpg' WHERE name = 'Organic Compost';

UPDATE pesticides SET image_path = '/images/pesticide_insecticide.jpg' WHERE name = 'Insecticide-A';
UPDATE pesticides SET image_path = '/images/pesticide_fungicide.jpg' WHERE name = 'Fungicide-B';

UPDATE machinery SET image_path = '/images/machinery_tractor.jpg' WHERE name = 'Tractor-A';
UPDATE machinery SET image_path = '/images/machinery_harvester.jpg' WHERE name = 'Combine Harvester-B';


-- crop
UPDATE crop SET image_path = '/images/crop_rice.jpg' WHERE name = 'Rice';
UPDATE crop SET image_path = '/images/crop_wheat.jpg' WHERE name = 'Wheat';
UPDATE crop SET image_path = '/images/crop_maize.jpg' WHERE name = 'Maize';
UPDATE crop SET image_path = '/images/crop_pulses.jpg' WHERE name = 'Pulses';
UPDATE crop SET image_path = '/images/crop_cotton.jpg' WHERE name = 'Cotton';
UPDATE crop SET image_path = '/images/crop_sugarcane.jpg' WHERE name = 'Sugarcane';
UPDATE crop SET image_path = '/images/crop_mustard.jpg' WHERE name = 'Mustard';
UPDATE crop SET image_path = '/images/crop_soybean.jpg' WHERE name = 'Soybean';
UPDATE crop SET image_path = '/images/crop_coffee.jpg' WHERE name = 'Coffee';
UPDATE crop SET image_path = '/images/crop_tea.jpg' WHERE name = 'Tea';
UPDATE crop SET image_path = '/images/crop_spices.jpg' WHERE name = 'Spices';
UPDATE crop SET image_path = '/images/crop_fruits.jpg' WHERE name = 'Fruits';
UPDATE crop SET image_path = '/images/crop_oilseeds.jpg' WHERE name = 'Oilseeds';
UPDATE crop SET image_path = '/images/crop_flowers.jpg' WHERE name = 'Flowers';
UPDATE crop SET image_path = '/images/crop_herbs.jpg' WHERE name = 'Herbs';
UPDATE crop SET image_path = '/images/crop_paddy.jpg' WHERE name = 'Paddy';
UPDATE crop SET image_path = '/images/crop_barley.jpg' WHERE name = 'Barley';
UPDATE crop SET image_path = '/images/crop_jute.jpg' WHERE name = 'Jute';
UPDATE crop SET image_path = '/images/crop_millet.jpg' WHERE name = 'Millet';
UPDATE crop SET image_path = '/images/crop_neem.jpg' WHERE name = 'Neem';

-- seeds
UPDATE seeds SET image_path = '/images/seeds_wheat.jpg' WHERE name = 'Wheat Seeds';
UPDATE seeds SET image_path = '/images/seeds_rice.jpg' WHERE name = 'Rice Seeds';
UPDATE seeds SET image_path = '/images/seeds_maize.jpeg' WHERE name = 'Maize Seeds';
UPDATE seeds SET image_path = '/images/seeds_barley.jpg' WHERE name = 'Barley Seeds';
UPDATE seeds SET image_path = '/images/seeds_soybean.jpg' WHERE name = 'Soybean Seeds';
UPDATE seeds SET image_path = '/images/seeds_paddy.jpg' WHERE name = 'Paddy Seeds';
UPDATE seeds SET image_path = '/images/seeds_cotton.jpg' WHERE name = 'Cotton Seeds';
UPDATE seeds SET image_path = '/images/seeds_jute.jpg' WHERE name = 'Jute Seeds';
UPDATE seeds SET image_path = '/images/seeds_sunflower.jpg' WHERE name = 'Sunflower Seeds';
UPDATE seeds SET image_path = '/images/seeds_mustard.jpg' WHERE name = 'Mustard Seeds';


--fertilizers
UPDATE fertilizers SET image_path = '/images/fertilizer_nitrogen_rich_blend.jpg' WHERE name = 'Nitrogen-Rich Blend';
UPDATE fertilizers SET image_path = '/images/fertilizer_phosphorus_based_mix.jpg' WHERE name = 'Phosphorus-Based Mix';
UPDATE fertilizers SET image_path = '/images/fertilizer_potassium_enriched_formula.jpg' WHERE name = 'Potassium-Enriched Formula';
UPDATE fertilizers SET image_path = '/images/fertilizer_complete_npk_fertilizer.jpg' WHERE name = 'Complete NPK Fertilizer';
UPDATE fertilizers SET image_path = '/images/fertilizer_organic_compost.jpg' WHERE name = 'Organic Compost';
UPDATE fertilizers SET image_path = '/images/fertilizer_microbial_inoculants.jpg' WHERE name = 'Microbial Inoculants';
UPDATE fertilizers SET image_path = '/images/fertilizer_calcium_rich_supplement.jpg' WHERE name = 'Calcium-Rich Supplement';
UPDATE fertilizers SET image_path = '/images/fertilizer_magnesium_infused_mix.jpg' WHERE name = 'Magnesium-Infused Mix';
UPDATE fertilizers SET image_path = '/images/fertilizer_sulfur_containing_blend.jpg' WHERE name = 'Sulfur-Containing Blend';
UPDATE fertilizers SET image_path = '/images/fertilizer_iron_enhanced_formula.jpg' WHERE name = 'Iron-Enhanced Formula';
UPDATE fertilizers SET image_path = '/images/fertilizer_zinc_based_fertilizer.png' WHERE name = 'Zinc-Based Fertilizer';
UPDATE fertilizers SET image_path = '/images/fertilizer_boron_enriched_mix.jpg' WHERE name = 'Boron-Enriched Mix';
UPDATE fertilizers SET image_path = '/images/fertilizer_manganese_infused_blend.jpg' WHERE name = 'Manganese-Infused Blend';
UPDATE fertilizers SET image_path = '/images/fertilizer_copper_rich_supplement.jpg' WHERE name = 'Copper-Rich Supplement';
UPDATE fertilizers SET image_path = '/images/fertilizer_silicon_based_fertilizer.jpg' WHERE name = 'Silicon-Based Fertilizer';

--pesticides
UPDATE pesticides SET image_path = '/images/pesticide_insecticide_a.jpg' WHERE name = 'Insecticide-A';
UPDATE pesticides SET image_path = '/images/pesticide_fungicide_b.jpg' WHERE name = 'Fungicide-B';
UPDATE pesticides SET image_path = '/images/pesticide_herbicide_c.jpg' WHERE name = 'Herbicide-C';
UPDATE pesticides SET image_path = '/images/pesticide_rodenticide_d.jpg' WHERE name = 'Rodenticide-D';
UPDATE pesticides SET image_path = '/images/pesticide_nematicide_e.jpg' WHERE name = 'Nematicide-E';
UPDATE pesticides SET image_path = '/images/pesticide_bactericide_f.jpg' WHERE name = 'Bactericide-F';
UPDATE pesticides SET image_path = '/images/pesticide_virucide_g.jpeg' WHERE name = 'Virucide-G';
UPDATE pesticides SET image_path = '/images/pesticide_molluscicide_h.jpg' WHERE name = 'Molluscicide-H';
UPDATE pesticides SET image_path = '/images/pesticide_miticide_i.jpg' WHERE name = 'Miticide-I';
UPDATE pesticides SET image_path = '/images/pesticide_repellent_j.jpg' WHERE name = 'Repellent-J';
UPDATE pesticides SET image_path = '/images/pesticide_attractant_k.jpg' WHERE name = 'Attractant-K';
UPDATE pesticides SET image_path = '/images/pesticide_antifeedant_l.jpg' WHERE name = 'Antifeedant-L';
UPDATE pesticides SET image_path = '/images/pesticide_biological_control_m.jpg' WHERE name = 'Biological Control-M';
UPDATE pesticides SET image_path = '/images/pesticide_rescue_chemical_n.jpg' WHERE name = 'Rescue Chemical-N';
UPDATE pesticides SET image_path = '/images/pesticide_plant_growth_regulator_o.jpg' WHERE name = 'Plant Growth Regulator-O';



--machinery
UPDATE machinery SET image_path = '/images/machinery_tractor_a.jpg' WHERE name = 'Tractor-A';
UPDATE machinery SET image_path = '/images/machinery_combine_harvester_b.jpg' WHERE name = 'Combine Harvester-B';
UPDATE machinery SET image_path = '/images/machinery_plough_c.jpg' WHERE name = 'Plough-C';
UPDATE machinery SET image_path = '/images/machinery_seeder_d.jpg' WHERE name = 'Seeder-D';
UPDATE machinery SET image_path = '/images/machinery_sprayer_e.jpg' WHERE name = 'Sprayer-E';
UPDATE machinery SET image_path = '/images/machinery_cultivator_f.jpg' WHERE name = 'Cultivator-F';
UPDATE machinery SET image_path = '/images/machinery_thresher_g.jpg' WHERE name = 'Thresher-G';
UPDATE machinery SET image_path = '/images/machinery_rotavator_h.jpg' WHERE name = 'Rotavator-H';
UPDATE machinery SET image_path = '/images/machinery_harrow_i.jpg' WHERE name = 'Harrow-I';
UPDATE machinery SET image_path = '/images/machinery_tiller_j.jpg' WHERE name = 'Tiller-J';
UPDATE machinery SET image_path = '/images/machinery_seeder_planter_k.jpg' WHERE name = 'Seeder-Planter-K';
UPDATE machinery SET image_path = '/images/machinery_transplanter_l.jpg' WHERE name = 'Transplanter-L';
UPDATE machinery SET image_path = '/images/machinery_sickle_bar_mower_m.jpg' WHERE name = 'Sickle-Bar Mower-M';
UPDATE machinery SET image_path = '/images/machinery_baler_n.jpg' WHERE name = 'Baler-N';
UPDATE machinery SET image_path = '/images/machinery_seeder_spreader_o.jpg' WHERE name = 'Seeder Spreader-O';












