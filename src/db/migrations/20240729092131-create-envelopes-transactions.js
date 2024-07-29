"use strict";

const Envelope = require("../models/envelopes.model");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("envelope_transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fromId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "envelopes",
            key: "id",
          },
        },
        field: "from_id",
      },
      toId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "envelopes",
            key: "id",
          },
        },
        field: "to_id",
      },
      transferredAmount: {
        allowNull: false,
        default: 0.0,
        type: Sequelize.DECIMAL(12, 2),
        field: "transferred_amount",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("envelope_transactions");
  },
};
