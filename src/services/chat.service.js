const Room = require('../models/room.model');
const ChatMessage = require('../models/chat.message.model');
const mongoose = require('mongoose');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');

class ChatService {
  async getAllRoom({ page, limit }, user) {
    const roomsData = await Room.aggregate([
      {
        $match: {
          userId: user._id,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          rooms: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const rooms = roomsData[0].rooms;
    const total = roomsData[0].totalCount[0]?.total || 0;

    const paginationInfo = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
    };

    return {
      data: {
        rooms,
        pagination: paginationInfo,
      },
      message: 'All rooms fetched successfully',
    };
  }

  async getAllMessage({ page, limit }, roomId, user) {
    const isUserRoom = await Room.findOne({ _id: roomId, userId: user._id });
    if (!isUserRoom) {
      throw new HttpException(
        errorType.FORBIDDEN.status,
        'User does not belong to this room'
      );
    }

    const chatData = await ChatMessage.aggregate([
      {
        $match: {
          $expr: {
            $eq: ['$roomId', { $toObjectId: roomId }],
          },
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $facet: {
          messages: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const messages = chatData[0].messages;
    const total = chatData[0].totalCount[0]?.total || 0;

    const paginationInfo = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
    };

    return {
      data: {
        messages,
        pagination: paginationInfo,
      },
      message: 'All messages fetched successfully',
    };
  }

  async changeRoomName(roomDetails, user) {
    const room = await Room.findOne({
      _id: roomDetails.roomId,
      userId: user._id,
    });

    if (!room) {
      throw new HttpException(
        errorType.FORBIDDEN.status,
        'User does not belong to this room'
      );
    }

    room.roomName = roomDetails.roomName;
    await room.save();

    return { message: 'Room name updated successfully' };
  }

  async deleteRoom(roomId, user) {
    const room = await Room.findOne({
      _id: roomId,
      userId: user._id,
    });

    if (!room) {
      throw new HttpException(
        errorType.FORBIDDEN.status,
        'User does not belong to this room'
      );
    }
    await ChatMessage.deleteMany({ roomId });
    await Room.findByIdAndDelete(roomId);
    return { message: 'Room and its messages deleted successfully' };
  }
}

module.exports = ChatService;
