-- AlterTable
ALTER TABLE `media` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `usageCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `category_tags` (
    `id` VARCHAR(191) NOT NULL,
    `dimension` ENUM('EMOTION', 'INDUSTRY', 'STYLE', 'SCENE', 'PLATFORM', 'TEMPO', 'MOOD') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `category_tags_dimension_idx`(`dimension`),
    INDEX `category_tags_sortOrder_idx`(`sortOrder`),
    UNIQUE INDEX `category_tags_dimension_name_key`(`dimension`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_categories` (
    `id` VARCHAR(191) NOT NULL,
    `mediaId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NULL DEFAULT 1.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `media_categories_mediaId_idx`(`mediaId`),
    INDEX `media_categories_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `media_categories_mediaId_categoryId_key`(`mediaId`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `tips` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `platform_preferences_platform_idx`(`platform`),
    UNIQUE INDEX `platform_preferences_platform_categoryId_key`(`platform`, `categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `media_usageCount_idx` ON `media`(`usageCount`);

-- AddForeignKey
ALTER TABLE `media_categories` ADD CONSTRAINT `media_categories_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_categories` ADD CONSTRAINT `media_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `platform_preferences` ADD CONSTRAINT `platform_preferences_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
