const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Envelope extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Envelope.belongsToMany(Envelope, {
        through: "envelope_transactions",
        as: "sourceEnvelope",
        foreignKey: "from_id",
      });

      Envelope.belongsToMany(Envelope, {
        through: "envelope_transactions",
        as: "destinationEnvelope",
        foreignKey: "to_id",
      });
    }
  }
  Envelope.init(
    {
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
        default: 0.0,
        validate: {
          notNull: true,
          isNumeric: true,
        },
        get() {
          const rawValue = this.getDataValue("budget");
          return rawValue ? Number(rawValue) : null;
        },
      },
    },
    {
      sequelize,
      underscored: true,
    }
  );

  return Envelope;
};
