import User from "../models/user.js"

export const getProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user.id).select("_id email username phoneno");
        res.status(200).json({
            message : "Fetched User Successfully",
            success : true ,
            data : userProfile
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", success : false});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updatedData = { ...req.body };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true }).select("_id email username phoneno");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        res.status(200).json({ message: "Profile updated successfully", success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", success: false });
    }
};
