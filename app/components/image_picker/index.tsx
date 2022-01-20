// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import {useIntl} from 'react-intl';
import {TouchableOpacity} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import CompassIcon from '@components/compass_icon';
import SlideUpPanelItem, {ITEM_HEIGHT} from '@components/slide_up_panel_item';
import {useServerUrl} from '@context/server';
import {useTheme} from '@context/theme';
import {bottomSheet} from '@screens/navigation';
import PickerUtil from '@utils/file/file_picker';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

import type UserModel from '@typings/database/models/servers/user';
import type {UploadExtractedFile} from '@typings/utils/file';

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        touchable: {
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.centerChannelBg,
            borderRadius: 18,
            height: 36,
            width: 36,
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: theme.centerChannelBg,
        },
    };
});

type ImagePickerProps = {
    canBrowseFiles?: boolean;
    canBrowsePhotoLibrary?: boolean;
    canTakePhoto?: boolean;
    onRemoveProfileImage: UploadExtractedFile;
    uploadFiles: UploadExtractedFile;
    user: UserModel;
};

const ImagePicker = ({
    canBrowseFiles = true,
    canBrowsePhotoLibrary = true,
    canTakePhoto = true,
    onRemoveProfileImage,
    uploadFiles,
    user,
}: ImagePickerProps) => {
    const intl = useIntl();
    const theme = useTheme();
    const serverUrl = useServerUrl();
    const pictureUtils = useMemo(() => new PickerUtil(intl, uploadFiles), [uploadFiles]);
    const styles = getStyleSheet(theme);

    const showFileAttachmentOptions = useCallback(() => {
        const canRemovePicture = pictureUtils.hasPictureUrl(user, serverUrl);

        const renderContent = () => {
            const renderPanelItems = (itemType: string) => {
                const types = {
                    takePhoto: {
                        icon: 'camera-outline',
                        onPress: () => pictureUtils.attachFileFromCamera(),
                        testID: 'attachment.takePhoto',
                        text: intl.formatMessage({id: 'mobile.file_upload.camera_photo', defaultMessage: 'Take Photo'}),
                    },
                    browsePhotoLibrary: {
                        icon: 'file-generic-outline',
                        onPress: () => pictureUtils.attachFileFromPhotoGallery(),
                        testID: 'attachment.browsePhotoLibrary',
                        text: intl.formatMessage({id: 'mobile.file_upload.library', defaultMessage: 'Photo Library'}),
                    },
                    browseFiles: {
                        icon: 'file-multiple-outline',
                        onPress: () => pictureUtils.attachFileFromFiles(DocumentPicker.types.images),
                        testID: 'attachment.browseFiles',
                        text: intl.formatMessage({id: 'mobile.file_upload.browse', defaultMessage: 'Browse Files'}),
                    },
                    removeProfilePicture: {
                        icon: 'trash-can-outline',
                        isDestructive: true,
                        onPress: () => {
                            return onRemoveProfileImage();
                        },
                        testID: 'attachment.removeImage',
                        text: intl.formatMessage({id: 'mobile.edit_profile.remove_profile_photo', defaultMessage: 'Remove Photo'}),
                    },
                };

                //@ts-expect-error object string index
                const item = types[itemType];
                return (
                    <SlideUpPanelItem
                        icon={item.icon}
                        onPress={item.onPress}
                        testID={item.testID}
                        text={item.text}
                        destructive={Boolean(item?.isDestructive)}
                    />
                );
            };

            return (
                <>
                    {canTakePhoto && renderPanelItems('takePhoto')}
                    {canBrowsePhotoLibrary && renderPanelItems('browsePhotoLibrary')}
                    {canBrowseFiles && renderPanelItems('browseFiles')}
                    {canRemovePicture && renderPanelItems('removeProfilePicture')}
                </>
            );
        };

        const snapPoints = canRemovePicture ? 5 : 4;

        return bottomSheet({
            closeButtonId: 'close-edit-profile',
            renderContent,
            snapPoints: [(snapPoints * ITEM_HEIGHT), 10],
            title: '',
            theme,
        });
    }, [user, onRemoveProfileImage]);

    return (
        <TouchableOpacity
            onPress={showFileAttachmentOptions}
            hitSlop={{top: 100, bottom: 20, right: 20, left: 100}}
            style={styles.touchable}
        >
            <CompassIcon
                name='camera-outline'
                size={24}
                color={changeOpacity(theme.centerChannelColor, 0.6)}
            />
        </TouchableOpacity>

    );
};

export default ImagePicker;
