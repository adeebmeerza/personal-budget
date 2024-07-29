const { DataTypes } = require("sequelize");
const db = require("../sequelize");

const Envelope = db.define("envelopes", {
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: true,
      notEmpty: true,
    },
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      notNull: true,
      isNumeric: true,
    },
    get() {
      const rawValue = this.getDataValue("budget");
      return rawValue ? Number(rawValue) : null;
    },
  },
});

module.exports = Envelope;
