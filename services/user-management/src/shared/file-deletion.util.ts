import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('FileDeletion');


export const deleteExistingFile = async (fileType: 'profile_image' | 'national_id' | 'llc_document', existingPath: string): Promise<void> => {
    try {

        if (await fs.pathExists(existingPath)) {
            await fs.unlink(existingPath);
            logger.log(`Previous ${fileType} deleted successfully: ${existingPath}`);
        } else {
            logger.warn(`File not found: ${existingPath}`);
        }
    } catch (err) {
        logger.error(`Error deleting file: ${existingPath}`, err.stack);
        throw new Error(`Failed to delete ${fileType}: ${err.message}`);
    }
};
