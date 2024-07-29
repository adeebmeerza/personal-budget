const { Model } = require("sequelize");
const Envelope = require("./envelopes.model");

module.exports = (sequelize, DataTypes) => {
  class EnvelopeTransaction extends Model {
    static associate(models) {}
  }
  EnvelopeTransaction.init(
    {
      fromId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Envelope,
          key: "id",
        },
      },
      toId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Envelope,
          key: "id",
        },
      },
      transferredAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      underscored: true,
      tableName: "envelope_transactions",
    }
  );
  return EnvelopeTransaction;
};
